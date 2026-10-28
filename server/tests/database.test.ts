import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import pg from "pg";
const connection = process.env.TEST_DATABASE_URL;
test(
  "Postgres migrations and commerce invariants",
  { skip: !connection },
  async (t) => {
    const url = new URL(connection!);
    assert.ok(
      ["127.0.0.1", "localhost"].includes(url.hostname),
      "Tests require isolated localhost PostgreSQL",
    );
    assert.match(url.pathname, /test/);
    const root = new pg.Client({ connectionString: connection });
    await root.connect();
    const name = `fresava_test_${Date.now()}`;
    await root.query(`create database ${name}`);
    await root.end();
    url.pathname = `/${name}`;
    const pool = new pg.Pool({ connectionString: url.toString() });
    try {
      await pool.query(
        `do $$ begin if not exists(select 1 from pg_roles where rolname='anon') then create role anon;end if;if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated;end if;if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role bypassrls;end if;if not exists(select 1 from pg_roles where rolname='supabase_auth_admin') then create role supabase_auth_admin;end if;end $$;create schema auth;create table auth.users(id uuid primary key,raw_app_meta_data jsonb default '{}',raw_user_meta_data jsonb default '{}');create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`,
      );
      for (const file of [
        "202609250001_foundation.sql",
        "202609250002_transactions.sql",
        "202610260001_order_cancellation.sql",
        "202610270001_product_images_bucket.sql",
        "202610280001_product_catalog_fields.sql",
        "202610290001_manufacturing_batches.sql",
        "202610300001_product_usd_pricing.sql",
        "202610310001_product_currency_prices.sql",
        "202611010001_customer_order_cancel.sql",
        "202611010002_customer_addresses.sql",
        "202611020001_product_stock_quantity.sql",
        "202611030001_rpc_reconciliation_live.sql",
        "202611040001_rpc_reconciliation_qc_pipeline.sql",
      ])
        await pool.query(
          await readFile(
            new URL(`../supabase/migrations/${file}`, import.meta.url),
            "utf8",
          ),
        );
      await pool.query(
        await readFile(
          new URL("../supabase/seed.sql", import.meta.url),
          "utf8",
        ),
      );
      const customerAuth = randomUUID(),
        staffAuth = randomUUID(),
        adminAuth = randomUUID();
      for (const [id, type] of [
        [customerAuth, "customer"],
        [staffAuth, "staff"],
        [adminAuth, "admin"],
      ])
        await pool.query(
          "insert into auth.users(id,raw_app_meta_data,raw_user_meta_data) values($1,$2,$3)",
          [
            id,
            type === "customer"
              ? { account_type: "customer" }
              : { account_type: "staff_member", role: type },
            { full_name: type },
          ],
        );
      const customer = (
        await pool.query(
          "select id from public.customers where auth_user_id=$1",
          [customerAuth],
        )
      ).rows[0].id;
      const staff = (
        await pool.query(
          "select id from public.staff_members where auth_user_id=$1 and role='staff'",
          [staffAuth],
        )
      ).rows[0].id;
      const admin = (
        await pool.query(
          "select id from public.staff_members where auth_user_id=$1 and role='admin'",
          [adminAuth],
        )
      ).rows[0].id;
      let order: string;
      const input = {
        quote: {
          lines: [{ sku: "single", quantity: 2 }],
          zone: "dhaka",
          promo: "FRESAVA10",
        },
        customer: {
          name: "Test Customer",
          phone: "01700000000",
          email: "test@example.invalid",
          address: "Test address",
          city: "Dhaka",
          notes: "",
        },
        idempotency_key: randomUUID(),
      };
      await t.test(
        "entities are exclusive and public metadata cannot assign admin",
        async () => {
          await assert.rejects(
            pool.query(
              "insert into public.staff_members(auth_user_id,role,full_name) values($1,'admin','bad')",
              [customerAuth],
            ),
            /Identity already assigned/,
          );
          const malicious = randomUUID();
          await pool.query(
            "insert into auth.users(id,raw_user_meta_data) values($1,$2)",
            [malicious, { account_type: "admin" }],
          );
          assert.equal(
            (
              await pool.query(
                "select count(*)::int n from public.customers where auth_user_id=$1",
                [malicious],
              )
            ).rows[0].n,
            1,
          );
          const hook = (
            await pool.query(
              "select public.custom_access_token_hook($1) result",
              [
                {
                  user_id: staffAuth,
                  claims: { sub: staffAuth, aud: "authenticated" },
                },
              ],
            )
          ).rows[0].result;
          assert.equal(hook.claims.account_type, "staff_member");
          assert.equal(hook.claims.role, "staff");
          assert.equal(hook.claims.entity_id, staff);
        },
      );
      await t.test("server quote prices and shipping after promo", async () => {
        const q = (
          await pool.query("select public.quote_order($1) q", [input.quote])
        ).rows[0].q;
        assert.equal(q.subtotal, 99000);
        assert.equal(q.discount, 9900);
        assert.equal(q.shipping, 7000);
        assert.equal(q.total, 96100);
        const free = (
          await pool.query("select public.quote_order($1) q", [
            {
              lines: [{ sku: "family", quantity: 1 }],
              zone: "outside",
              promo: "FRESAVA10",
            },
          ])
        ).rows[0].q;
        assert.equal(free.shipping, 0);
        await assert.rejects(
          pool.query("select public.quote_order($1)", [
            { ...input.quote, lines: [{ sku: "single", quantity: 1.5 }] },
          ]),
          /Invalid cart/,
        );
        await assert.rejects(
          pool.query("select public.quote_order($1)", [
            { ...input.quote, promo: "INVALID" },
          ]),
          /Invalid promo/,
        );
      });
      await t.test(
        "concurrent checkout creates exactly one order and rejects changed retry",
        async () => {
          const results = await Promise.all(
            Array.from({ length: 4 }, () =>
              pool.query("select public.place_order($1,null,$2) o", [
                customer,
                input,
              ]),
            ),
          );
          order = results[0].rows[0].o.id;
          assert.ok(results.every((r) => r.rows[0].o.id === order));
          assert.equal(
            (await pool.query("select count(*)::int n from orders")).rows[0].n,
            1,
          );
          assert.equal(
            (
              await pool.query(
                "select count(*)::int n from order_items where order_id=$1",
                [order],
              )
            ).rows[0].n,
            1,
          );
          await assert.rejects(
            pool.query("select public.place_order($1,null,$2)", [
              customer,
              { ...input, customer: { ...input.customer, name: "Changed" } },
            ]),
            /Idempotency key conflict/,
          );
        },
      );
      await t.test(
        "item failure rolls back order and initial history",
        async () => {
          await pool.query(
            "create function public.fail_items() returns trigger language plpgsql as $$begin raise exception 'injected item failure';end$$;create trigger fail_items before insert on order_items for each row execute function public.fail_items()",
          );
          await assert.rejects(
            pool.query("select public.place_order($1,null,$2)", [
              customer,
              { ...input, idempotency_key: randomUUID() },
            ]),
            /injected item failure/,
          );
          assert.equal(
            (await pool.query("select count(*)::int n from orders")).rows[0].n,
            1,
          );
          assert.equal(
            (
              await pool.query(
                "select count(*)::int n from order_status_history",
              )
            ).rows[0].n,
            1,
          );
          await pool.query(
            "drop trigger fail_items on order_items;drop function public.fail_items()",
          );
        },
      );
      await t.test(
        "staff scans are retry safe and concurrent stale updates are rejected",
        async () => {
          const request = randomUUID();
          const res = await Promise.all([
            pool.query("select public.advance_order($1,$2,0,$3) o", [
              order,
              staff,
              request,
            ]),
            pool.query("select public.advance_order($1,$2,0,$3) o", [
              order,
              staff,
              request,
            ]),
          ]);
          assert.equal(res[0].rows[0].o.version, 1);
          assert.deepEqual(res[0].rows[0].o, res[1].rows[0].o);
          await assert.rejects(
            pool.query("select public.advance_order($1,$2,0,$3)", [
              order,
              staff,
              randomUUID(),
            ]),
            /Order changed/,
          );
          await assert.rejects(
            pool.query("select public.advance_order($1,$2,1,$3)", [
              order,
              admin,
              randomUUID(),
            ]),
            /Not authorized/,
          );
        },
      );
      await t.test(
        "feedback checks delivery, ownership and uniqueness",
        async () => {
          await assert.rejects(
            pool.query("select public.submit_feedback($1,$2,null,5,'Great')", [
              order,
              customer,
            ]),
            /Feedback requires delivery/,
          );
          for (let v = 1; v < 7; v++)
            await pool.query("select public.advance_order($1,$2,$3,$4)", [
              order,
              staff,
              v,
              randomUUID(),
            ]);
          await assert.rejects(
            pool.query("select public.submit_feedback($1,$2,null,5,'Great')", [
              order,
              randomUUID(),
            ]),
            /Not authorized/,
          );
          await pool.query(
            "select public.submit_feedback($1,$2,null,5,'Great')",
            [order, customer],
          );
          await assert.rejects(
            pool.query("select public.submit_feedback($1,$2,null,4,'Again')", [
              order,
              customer,
            ]),
            /Feedback already submitted/,
          );
          assert.equal(
            (
              await pool.query(
                "select count(*)::int n from order_status_history where order_id=$1",
                [order],
              )
            ).rows[0].n,
            8,
          );
        },
      );
      await t.test(
        "collection is explicit, audited and idempotent",
        async () => {
          assert.equal(
            (
              await pool.query(
                "select payment_status from orders where id=$1",
                [order],
              )
            ).rows[0].payment_status,
            "unpaid",
          );
          await pool.query("select public.collect_payment($1,$2)", [
            order,
            admin,
          ]);
          await pool.query("select public.collect_payment($1,$2)", [
            order,
            admin,
          ]);
          assert.equal(
            (
              await pool.query(
                "select count(*)::int n from audit_log where action='payment.collected'",
              )
            ).rows[0].n,
            1,
          );
          const dashboard = (await pool.query("select public.dashboard() d"))
            .rows[0].d;
          assert.equal(dashboard.collected_revenue, 96100);
          assert.equal(dashboard.months.length, 6);
        },
      );
      await t.test("guest expiry and browser grants fail closed", async () => {
        const guest = (
          await pool.query(
            "insert into guest_sessions(token_hash,expires_at) values('expired',now()-interval '1 day') returning id",
          )
        ).rows[0].id;
        await assert.rejects(
          pool.query("select public.place_order(null,$1,$2)", [
            guest,
            { ...input, idempotency_key: randomUUID() },
          ]),
          /Not authorized/,
        );
        const result = await pool.query(
          "select has_table_privilege('anon','public.orders','select') allowed,has_function_privilege('authenticated','public.place_order(uuid,uuid,jsonb)','execute') can_order",
        );
        assert.equal(result.rows[0].allowed, false);
        assert.equal(result.rows[0].can_order, false);
      });
    } finally {
      await pool.end();
    }
  },
);

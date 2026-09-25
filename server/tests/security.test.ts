import { test } from "node:test";
import assert from "node:assert/strict";
import { assertPrincipal, enforceOrigin } from "../domain/authorization";
import { checkoutSchema, quoteSchema } from "../../shared/contracts";
import { imageType } from "../modules/customers/avatar";
test("account types cannot cross modules or inactive entities", () => {
  const entity = { id: "e", auth_user_id: "u", active: true };
  assert.doesNotThrow(() =>
    assertPrincipal(
      {
        account_type: "staff_member",
        entity_id: "e",
        sub: "u",
        role: "admin",
      },
      "staff_member",
      { ...entity, role: "admin" },
      "admin",
    ),
  );
  assert.throws(() =>
    assertPrincipal(
      {
        account_type: "staff_member",
        entity_id: "e",
        sub: "u",
        role: "admin",
      },
      "staff_member",
      { ...entity, role: "staff" },
      "staff",
    ),
  );
  assert.throws(() =>
    assertPrincipal(
      {
        account_type: "staff_member",
        entity_id: "e",
        sub: "u",
        role: "admin",
      },
      "customer",
      entity,
    ),
  );
  assert.throws(() =>
    assertPrincipal(
      {
        account_type: "staff_member",
        entity_id: "e",
        sub: "u",
        role: "admin",
      },
      "staff_member",
      { ...entity, active: false, role: "admin" },
      "admin",
    ),
  );
  assert.throws(() =>
    assertPrincipal(
      {
        account_type: "staff_member",
        entity_id: "another",
        sub: "u",
        role: "admin",
      },
      "staff_member",
      { ...entity, role: "admin" },
      "admin",
    ),
  );
});
test("cookie mutations require the configured origin", () => {
  assert.doesNotThrow(() =>
    enforceOrigin("https://fresava.test", "https://fresava.test"),
  );
  for (const origin of [
    null,
    "https://evil.test",
    "https://fresava.test.evil.test",
  ])
    assert.throws(() => enforceOrigin(origin, "https://fresava.test"));
});
test("untrusted prices, fractional quantities and duplicate lines are rejected", () => {
  assert.equal(
    quoteSchema.safeParse({
      lines: [{ sku: "single", quantity: 1, price: 1 }],
      zone: "dhaka",
    }).success,
    false,
  );
  assert.equal(
    quoteSchema.safeParse({
      lines: [{ sku: "single", quantity: 1.2 }],
      zone: "dhaka",
    }).success,
    false,
  );
  assert.equal(
    quoteSchema.safeParse({
      lines: [
        { sku: "single", quantity: 1 },
        { sku: "single", quantity: 1 },
      ],
      zone: "dhaka",
    }).success,
    false,
  );
  assert.equal(
    checkoutSchema.safeParse({ customer_id: "attacker" }).success,
    false,
  );
});
test("avatar validation rejects disguised files", () => {
  assert.throws(() =>
    imageType(new TextEncoder().encode('<svg onload="alert(1)"></svg>')),
  );
  assert.equal(
    imageType(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])).mime,
    "image/png",
  );
});

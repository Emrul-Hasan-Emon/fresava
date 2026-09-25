import { database } from "../infrastructure/supabase";
import { z } from "zod";
const input = z
  .object({
    BOOTSTRAP_EMAIL: z.email(),
    BOOTSTRAP_PASSWORD: z.string().min(12),
    BOOTSTRAP_NAME: z.string().min(1),
    BOOTSTRAP_TYPE: z.enum(["admin", "staff"]),
    BOOTSTRAP_EMPLOYEE_CODE: z.string().optional(),
  })
  .parse(process.env);
async function main() {
  const { data, error } = await database().auth.admin.createUser({
    email: input.BOOTSTRAP_EMAIL,
    password: input.BOOTSTRAP_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: input.BOOTSTRAP_NAME },
    app_metadata: {
      account_type: "staff_member",
      role: input.BOOTSTRAP_TYPE,
      ...(input.BOOTSTRAP_TYPE === "staff"
        ? {
            employee_code: input.BOOTSTRAP_EMPLOYEE_CODE ?? crypto.randomUUID(),
          }
        : {}),
    },
  });
  if (error)
    throw new Error(
      "Provisioning failed. Verify migrations, credentials, and whether this email already exists.",
    );
  // The auth.users provisioning trigger fires on INSERT, but the Admin API's
  // app_metadata can land a moment after the row is first created, so the
  // trigger may have already defaulted this identity to a customer row.
  // Reconcile explicitly instead of trusting the trigger's timing: clear out
  // whatever the trigger created for this identity (right or wrong; both
  // deletes are no-ops when there's nothing to clean up), then insert the
  // entity we actually want directly.
  const clearedCustomer = await database()
    .from("customers")
    .delete()
    .eq("auth_user_id", data.user.id);
  if (clearedCustomer.error)
    throw new Error(
      "Could not reconcile a mis-provisioned customer row. Inspect the database.",
    );
  const clearedStaff = await database()
    .from("staff_members")
    .delete()
    .eq("auth_user_id", data.user.id);
  if (clearedStaff.error)
    throw new Error(
      "Could not reconcile an existing staff_members row. Inspect the database.",
    );
  const employeeCode =
    input.BOOTSTRAP_TYPE === "staff"
      ? (input.BOOTSTRAP_EMPLOYEE_CODE ?? crypto.randomUUID())
      : null;
  const entity = await database()
    .from("staff_members")
    .insert({
      auth_user_id: data.user.id,
      role: input.BOOTSTRAP_TYPE,
      full_name: input.BOOTSTRAP_NAME,
      employee_code: employeeCode,
    })
    .select("id,role")
    .single();
  if (entity.error)
    throw new Error(
      "Identity created but entity could not be provisioned. Inspect the database.",
    );
  const audit = await database()
    .from("audit_log")
    .insert({
      actor_type: "system",
      action: `${input.BOOTSTRAP_TYPE}.provisioned`,
      entity_id: entity.data.id,
    });
  if (audit.error)
    throw new Error(
      "Account created but audit write failed. Inspect the database.",
    );
  console.log(
    `Provisioned ${input.BOOTSTRAP_TYPE} entity ${entity.data.id}. Remove the bootstrap password from your environment.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

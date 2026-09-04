import { eq } from "drizzle-orm";
import { db, notificationsTable, usersTable } from "@workspace/db";

export type NotificationType =
  | "new_order"
  | "new_customer"
  | "low_stock"
  | "out_of_stock"
  | "cancelled_order"
  | "problem_report";

export async function notifyAdmins(input: {
  type: NotificationType;
  title: string;
  message: string;
  entityId?: number;
}): Promise<void> {
  const admins = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, "admin"));

  if (admins.length === 0) return;

  await db.insert(notificationsTable).values(
    admins.map((admin) => ({
      adminId: admin.id,
      type: input.type,
      title: input.title,
      message: input.message,
      entityId: input.entityId ?? null,
    })),
  );
}
import { createClient } from "@/lib/supabase/server"

/** The type of edit action performed. */
export type EditAction = "CREATE" | "UPDATE" | "DELETE"

/** A single entry to be written to the edit_logs table. */
export interface EditLogEntry {
  adminName: string
  action: EditAction
  tableName: string
  recordId?: number | string
  recordName?: string
  changes?: Record<string, any>
}

/**
 * Appends a row to the `edit_logs` table via the server Supabase client.
 *
 * @param entry - The edit details to record.
 */
export async function logEdit(entry: EditLogEntry) {
  try {
    const supabase = await createClient()

    // The record_id column is bigint in the DB schema - non-numeric ids (e.g. UUIDs)
    // must be skipped to avoid a SQL error.
    let numericRecordId: number | null = null
    if (entry.recordId !== undefined && entry.recordId !== null) {
      const asNumber = typeof entry.recordId === 'number' ? entry.recordId : Number(entry.recordId as any)
      if (Number.isInteger(asNumber)) numericRecordId = asNumber
    }

    const { error } = await supabase.from("edit_logs").insert([
      {
        admin_name: entry.adminName,
        action: entry.action,
        table_name: entry.tableName,
        record_id: numericRecordId,
        record_name: entry.recordName || null,
        changes: entry.changes || null,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Failed to log edit:", error)
    }
  } catch (error) {
    console.error("Error logging edit:", error)
  }
}

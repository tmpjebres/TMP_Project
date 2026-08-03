import { supabaseClient } from "@/lib/supabase/client";

export type ActivityChanges = Record<string, { from: string; to: string }>;

/** Catat aktivitas user yang sedang login, fire-and-forget */
export function logActivity(
  action: string,
  entityType: string,
  entityLabel?: string,
  changes?: ActivityChanges,
) {
  supabaseClient.auth.getUser().then(({ data: { user } }) => {
    if (!user) return;
    supabaseClient
      .from("activity_log")
      .insert({
        actor_id: user.id,
        actor_username: (user.user_metadata?.username as string | undefined) ?? null,
        action,
        entity_type: entityType,
        entity_label: entityLabel ?? null,
        changes: changes && Object.keys(changes).length > 0 ? (changes as never) : null,
      })
      .then(undefined, () => {});
  });
}

/** Susun snapshot field jadi format changes untuk aktivitas create/delete */
export function snapshotChanges(fields: Record<string, string>, mode: "create" | "delete"): ActivityChanges {
  const changes: ActivityChanges = {};
  for (const [key, value] of Object.entries(fields)) {
    changes[key] = mode === "create" ? { from: "-", to: value || "-" } : { from: value || "-", to: "-" };
  }
  return changes;
}

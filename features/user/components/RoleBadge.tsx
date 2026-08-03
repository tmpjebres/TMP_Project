import { Shield, User } from "lucide-react";
import type { Role } from "@/types";

export function RoleBadge({ role }: { role: Role }) {
  if (role === "master") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-brass-light text-brass-dark border border-brass/25">
        <Shield size={11} />
        Master
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-light text-green-primary border border-green-accent/25">
      <User size={11} />
      Operator
    </span>
  );
}

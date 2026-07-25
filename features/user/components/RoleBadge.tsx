import { Shield, User } from "lucide-react";
import type { Role } from "@/types";

export function RoleBadge({ role }: { role: Role }) {
  if (role === "master") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-100 text-violet-700 border border-violet-200">
        <Shield size={11} />
        Master
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-700 border border-sky-200">
      <User size={11} />
      Operator
    </span>
  );
}
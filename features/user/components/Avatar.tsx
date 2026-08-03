import type { Role } from "@/types";

export function Avatar({ username, role }: { username: string; role: Role }) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ring-1
        ${role === "master"
          ? "bg-brass-light text-brass-dark ring-brass/20"
          : "bg-green-light text-green-primary ring-green-accent/20"
        }`}
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      {initials}
    </div>
  );
}

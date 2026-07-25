import type { Role } from "@/types";

export function Avatar({ username, role }: { username: string; role: Role }) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
        ${role === "master"
          ? "bg-violet-100 text-violet-700"
          : "bg-sky-100 text-sky-700"
        }`}
    >
      {initials}
    </div>
  );
}
import { Pencil, Trash2, User } from "lucide-react";
import type { AppUser } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingAnimation";
import { formatLastLogin } from "@/lib/utils/date";
import { Avatar } from "./Avatar";
import { RoleBadge } from "./RoleBadge";
import { StatusBadge } from "./StatusBadge";

export function UserTable({
  users,
  loading,
  isMaster,
  currentUserId,
  hasActiveFilter,
  onResetFilter,
  onEdit,
  onDelete,
}: {
  users: AppUser[];
  loading: boolean;
  isMaster: boolean;
  currentUserId?: string;
  hasActiveFilter: boolean;
  onResetFilter: () => void;
  onEdit: (user: AppUser) => void;
  onDelete: (user: AppUser) => void;
}) {
  if (loading) return <LoadingSpinner />;

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-neutral-400">
        <User size={32} className="opacity-30" />
        <p className="text-sm font-medium">
          {hasActiveFilter ? "Tidak ada hasil yang cocok." : "Belum ada user."}
        </p>
        {hasActiveFilter && (
          <button onClick={onResetFilter} className="text-xs text-violet-500 hover:underline">
            Reset filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/60">
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Pengguna
            </th>
            <th className="text-center px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Role
            </th>
            <th className="text-center px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Status
            </th>
            <th className="text-center px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Login Terakhir
            </th>
            {isMaster && (
              <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide text-center">
                Aksi
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors group">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar username={u.username} role={u.role} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900 truncate">
                        {u.fullName}
                      </span>
                      {u.id === currentUserId && (
                        <span className="text-xs text-violet-500 font-medium bg-violet-50 px-1.5 py-0.5 rounded-md flex-shrink-0">
                          Anda
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate">@{u.username}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5 justify-center text-center">
                <RoleBadge role={u.role} />
              </td>
              <td className="px-5 py-3.5 text-center">
                <StatusBadge isActive={u.isActive} />
              </td>
              <td className="px-5 py-3.5 text-neutral-400 text-xs text-center">
                {formatLastLogin(u.lastLoginAt)}
              </td>
              {isMaster && (
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-center gap-1">
                    {/* Edit */}
                    <button
                      onClick={() => onEdit(u)}
                      title="Edit user"
                      className="p-1.5 rounded-lg hover:bg-violet-50 text-neutral-400 hover:text-violet-600 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>

                    {/* Delete — tidak bisa hapus diri sendiri */}
                    {u.id !== currentUserId ? (
                      <button
                        onClick={() => onDelete(u)}
                        title="Hapus user"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : (
                      <div className="w-[30px]" />
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
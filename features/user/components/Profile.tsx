'use client';

import { useState } from 'react';
import { CheckCircle2, User } from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context';
import Toast from '@/components/ui/Toast';

export default function Profile() {
  const { user, updatePassword } = useAuth();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPwd.length < 8) { setError('Password baru minimal 8 karakter.'); return; }
    if (newPwd !== confirmPwd) { setError('Konfirmasi password tidak cocok.'); return; }

    setLoading(true);
    const result = await updatePassword(currentPwd, newPwd);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Gagal mengubah password.');
      return;
    }

    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setShowToast(true);
  };

  return (
    <div className="animate-fade-in">
      {showToast && <Toast message="Password berhasil diperbarui" onDone={() => setShowToast(false)} />}

      <div className="mb-6">
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 28, fontWeight: 800 }} className="text-neutral-black">Profil</h1>
        <p className="text-base text-neutral-gray mt-1">Informasi akun Anda</p>
      </div>

      <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: '1px solid rgba(221,221,221,0.5)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 bg-green-light rounded-full flex items-center justify-center flex-shrink-0">
            <User size={40} className="text-green-primary" />
          </div>
          <div>
            <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 700 }} className="text-neutral-black">{user?.username}</p>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full mt-1 inline-block ${user?.role === 'master' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {user?.role === 'master' ? 'Master' : 'Operator'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-neutral-gray uppercase tracking-wider mb-2">Username</label>
            <input type="text" value={user?.username ?? ''} readOnly
              className="form-input text-base py-3.5 bg-neutral-light-gray cursor-not-allowed text-neutral-gray" />
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-gray uppercase tracking-wider mb-2">Role</label>
            <input type="text" value={user?.role === 'master' ? 'Master' : 'Operator'} readOnly
              className="form-input text-base py-3.5 bg-neutral-light-gray cursor-not-allowed text-neutral-gray" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid rgba(221,221,221,0.5)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700 }} className="text-neutral-black mb-6">
          Ganti Password
        </h2>
        <form onSubmit={handleUpdatePassword}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-base font-semibold text-neutral-black mb-2">Password Saat Ini</label>
              <input type="password" className="form-input text-base py-3.5" placeholder="Password saat ini" value={currentPwd}
                onChange={e => { setCurrentPwd(e.target.value); setError(''); }} />
            </div>
            <div>
              <label className="block text-base font-semibold text-neutral-black mb-2">Password Baru</label>
              <input type="password" className="form-input text-base py-3.5" placeholder="Min. 8 karakter" value={newPwd}
                onChange={e => { setNewPwd(e.target.value); setError(''); }} />
            </div>
            <div>
              <label className="block text-base font-semibold text-neutral-black mb-2">Konfirmasi Password</label>
              <input type="password" className="form-input text-base py-3.5" placeholder="Ulangi password baru" value={confirmPwd}
                onChange={e => { setConfirmPwd(e.target.value); setError(''); }} />
            </div>
          </div>
          {error && <p className="text-base text-status-danger font-medium mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading || !currentPwd || !newPwd || !confirmPwd}
            className="btn-primary text-base py-3.5 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Menyimpan...
              </span>
            ) : (
              <>
                <CheckCircle2 size={20} className="mr-2" /> Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

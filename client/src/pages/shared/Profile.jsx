import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { authApi } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';

export default function Profile() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authApi.updateProfile(profile);
      await refresh();
      toast('Profile updated', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setSavingPwd(true);
    try {
      await authApi.changePassword(pwd);
      setPwd({ currentPassword: '', newPassword: '' });
      toast('Password changed', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Profile</h1>
        <p className="mt-1 text-sm text-navy-500">Manage your account information and password.</p>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-navy-800">Account Info</h2>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-navy-500">Email</p>
            <p className="mt-0.5 text-sm font-medium text-navy-800">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-navy-500">Role</p>
            <p className="mt-0.5 text-sm font-medium text-navy-800">{user?.role}</p>
          </div>
        </div>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-navy-800">Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" value={pwd.currentPassword}
              onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} required />
          </div>
          <div>
            <label className="label">New Password (min 8 characters)</label>
            <input type="password" className="input" value={pwd.newPassword}
              onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required minLength={8} />
          </div>
          <button type="submit" className="btn-primary" disabled={savingPwd}>
            {savingPwd ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

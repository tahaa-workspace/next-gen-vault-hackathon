import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const ownerNav = [
  { to: '/owner/dashboard', label: 'Dashboard' },
  { to: '/owner/liabilities', label: 'Liabilities' },
  { to: '/owner/beneficiaries', label: 'Beneficiaries' },
  { to: '/owner/permissions', label: 'Permissions' },
  { to: '/owner/profile', label: 'Profile' },
];

const beneficiaryNav = [
  { to: '/beneficiary/dashboard', label: 'Dashboard' },
  { to: '/beneficiary/invitations', label: 'Invitations' },
  { to: '/beneficiary/owners', label: 'Assigned Owners' },
  { to: '/beneficiary/activation', label: 'Activation' },
  { to: '/beneficiary/profile', label: 'Profile' },
];

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/activation-requests', label: 'Activation Requests' },
  { to: '/admin/profile', label: 'Profile' },
];

const roleNav = {
  OWNER: ownerNav,
  BENEFICIARY: beneficiaryNav,
  ADMIN: adminNav,
};

const roleColor = {
  OWNER: 'bg-teal-100 text-teal-700',
  BENEFICIARY: 'bg-navy-100 text-navy-700',
  ADMIN: 'bg-amber-100 text-amber-700',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = roleNav[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    toast('Logged out', 'info');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-navy-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-navy-100 bg-navy-900 text-white transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-navy-800 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 font-bold text-white">V</div>
          <span className="text-lg font-semibold">Next Gen Vault</span>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-teal-500 text-white' : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-navy-800 p-3">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-navy-200 hover:bg-navy-800 hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-navy-950/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-navy-100 bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-navy-600 hover:bg-navy-50 md:hidden"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label="Toggle sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className={`badge ${roleColor[user?.role] || ''}`}>{user?.role}</span>
            <span className="text-sm text-navy-600">{user?.name}</span>
          </div>
          <span className="hidden text-xs text-navy-400 sm:block">Liability Management Prototype</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

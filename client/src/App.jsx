import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

import Landing from './pages/auth/Landing.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Unauthorized from './pages/auth/Unauthorized.jsx';

import OwnerDashboard from './pages/owner/OwnerDashboard.jsx';
import LiabilityList from './pages/owner/LiabilityList.jsx';
import LiabilityForm from './pages/owner/LiabilityForm.jsx';
import LiabilityDetail from './pages/owner/LiabilityDetail.jsx';
import Beneficiaries from './pages/owner/Beneficiaries.jsx';
import Permissions from './pages/owner/Permissions.jsx';
import Profile from './pages/shared/Profile.jsx';

import BeneficiaryDashboard from './pages/beneficiary/BeneficiaryDashboard.jsx';
import Invitations from './pages/beneficiary/Invitations.jsx';
import AssignedOwners from './pages/beneficiary/AssignedOwners.jsx';
import OwnerDetail from './pages/beneficiary/OwnerDetail.jsx';
import ActivationRequest from './pages/beneficiary/ActivationRequest.jsx';
import ReleasedLiability from './pages/beneficiary/ReleasedLiability.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import ActivationRequests from './pages/admin/ActivationRequests.jsx';
import ActivationRequestDetail from './pages/admin/ActivationRequestDetail.jsx';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'OWNER') return <Navigate to="/owner/dashboard" replace />;
  if (user.role === 'BENEFICIARY') return <Navigate to="/beneficiary/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function withLayout(roles, page) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{page}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/owner/dashboard" element={withLayout(['OWNER'], <OwnerDashboard />)} />
      <Route path="/owner/liabilities" element={withLayout(['OWNER'], <LiabilityList />)} />
      <Route path="/owner/liabilities/new" element={withLayout(['OWNER'], <LiabilityForm />)} />
      <Route path="/owner/liabilities/:id" element={withLayout(['OWNER'], <LiabilityDetail />)} />
      <Route path="/owner/liabilities/:id/edit" element={withLayout(['OWNER'], <LiabilityForm />)} />
      <Route path="/owner/beneficiaries" element={withLayout(['OWNER'], <Beneficiaries />)} />
      <Route path="/owner/permissions" element={withLayout(['OWNER'], <Permissions />)} />
      <Route path="/owner/profile" element={withLayout(['OWNER'], <Profile />)} />

      <Route path="/beneficiary/dashboard" element={withLayout(['BENEFICIARY'], <BeneficiaryDashboard />)} />
      <Route path="/beneficiary/invitations" element={withLayout(['BENEFICIARY'], <Invitations />)} />
      <Route path="/beneficiary/owners" element={withLayout(['BENEFICIARY'], <AssignedOwners />)} />
      <Route path="/beneficiary/owners/:ownerId" element={withLayout(['BENEFICIARY'], <OwnerDetail />)} />
      <Route path="/beneficiary/activation" element={withLayout(['BENEFICIARY'], <ActivationRequest />)} />
      <Route path="/beneficiary/released/:id" element={withLayout(['BENEFICIARY'], <ReleasedLiability />)} />
      <Route path="/beneficiary/profile" element={withLayout(['BENEFICIARY'], <Profile />)} />

      <Route path="/admin/dashboard" element={withLayout(['ADMIN'], <AdminDashboard />)} />
      <Route path="/admin/users" element={withLayout(['ADMIN'], <AdminUsers />)} />
      <Route path="/admin/activation-requests" element={withLayout(['ADMIN'], <ActivationRequests />)} />
      <Route path="/admin/activation-requests/:id" element={withLayout(['ADMIN'], <ActivationRequestDetail />)} />
      <Route path="/admin/profile" element={withLayout(['ADMIN'], <Profile />)} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

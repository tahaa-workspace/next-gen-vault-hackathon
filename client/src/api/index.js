import api from './client.js';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

export const liabilityApi = {
  dashboard: () => api.get('/liabilities/dashboard'),
  list: (params) => api.get('/liabilities', { params }),
  get: (id) => api.get(`/liabilities/${id}`),
  create: (data) => api.post('/liabilities', data),
  update: (id, data) => api.patch(`/liabilities/${id}`, data),
  delete: (id) => api.delete(`/liabilities/${id}`),
  close: (id) => api.post(`/liabilities/${id}/close`),
  archive: (id) => api.post(`/liabilities/${id}/archive`),
  restore: (id) => api.post(`/liabilities/${id}/restore`),
};

export const documentApi = {
  upload: (formData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  list: (liabilityId) => api.get(`/documents/liability/${liabilityId}`),
  get: (id) => api.get(`/documents/${id}`),
  delete: (id) => api.delete(`/documents/${id}`),
  downloadUrl: (id) => `${baseURL}/documents/${id}/download`,
};

export const beneficiaryApi = {
  list: () => api.get('/beneficiaries'),
  add: (data) => api.post('/beneficiaries', data),
  accept: (id) => api.patch(`/beneficiaries/${id}/accept`),
  reject: (id) => api.patch(`/beneficiaries/${id}/reject`),
  revoke: (id) => api.delete(`/beneficiaries/${id}`),
  invitations: () => api.get('/beneficiaries/invitations'),
  owners: () => api.get('/beneficiaries/owners'),
};

export const permissionApi = {
  list: (params) => api.get('/permissions', { params }),
  create: (data) => api.post('/permissions', data),
  bulk: (data) => api.post('/permissions/bulk', data),
  update: (id, data) => api.patch(`/permissions/${id}`, data),
  delete: (id) => api.delete(`/permissions/${id}`),
};

export const activationApi = {
  create: (data) => api.post('/activation-requests', data),
  mine: () => api.get('/activation-requests/mine'),
};

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  users: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  activationRequests: (params) => api.get('/admin/activation-requests', { params }),
  activationRequest: (id) => api.get(`/admin/activation-requests/${id}`),
  updateRequestStatus: (id, data) => api.patch(`/admin/activation-requests/${id}/status`, data),
  decide: (id, data) => api.patch(`/admin/activation-requests/${id}/decision`, data),
};

export const releaseApi = {
  liabilities: (ownerId) => api.get('/beneficiary/released/liabilities', { params: { ownerId } }),
  liability: (id) => api.get(`/beneficiary/released/liabilities/${id}`),
  documentDownloadUrl: (id) => `${baseURL}/beneficiary/released/documents/${id}/download`,
};

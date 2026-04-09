import api from './api';

export async function listUsers(params = {}) {
  const { data } = await api.get('/api/users', { params });
  return data;
}

export async function createUser(payload) {
  const { data } = await api.post('/api/users', payload);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await api.patch(`/api/users/${id}`, payload);
  return data;
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/api/users/${id}`);
  return data;
}


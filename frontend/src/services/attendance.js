import api from './api';

export async function getMyAttendance() {
  const { data } = await api.get('/api/attendance/me');
  return data;
}

export async function getAttendance(studentId) {
  const { data } = await api.get(`/api/attendance/${studentId}`);
  return data;
}

export async function markAttendance(studentId, payload) {
  const { data } = await api.post(`/api/attendance/${studentId}`, payload);
  return data;
}


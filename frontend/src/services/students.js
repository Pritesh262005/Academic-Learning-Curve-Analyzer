import api from './api';

export async function listStudents(params = {}) {
  const { data } = await api.get('/api/students', { params });
  return data;
}

export async function addMarks(studentId, payload) {
  const { data } = await api.post(`/api/students/${studentId}/marks`, payload);
  return data;
}

export async function getMyMarks() {
  const { data } = await api.get('/api/students/me/marks');
  return data;
}

export async function getStudentMarks(studentId) {
  const { data } = await api.get(`/api/students/${studentId}/marks`);
  return data;
}

export async function getMyStudentRecord() {
  const { data } = await api.get('/api/students/me');
  return data;
}


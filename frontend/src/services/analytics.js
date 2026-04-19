import api from './api';

export async function getClassAverage() {
  const { data } = await api.get('/api/analytics/class-average');
  return data;
}

export async function getTopperList(params = {}) {
  const { data } = await api.get('/api/analytics/topper', { params });
  return data;
}

export async function getWeakStudents(params = {}) {
  const { data } = await api.get('/api/analytics/weak-students', { params });
  return data;
}

export async function getMySuggestions() {
  const { data } = await api.get('/api/analytics/me/suggestions');
  return data;
}

export async function getSubjectCurve(params = {}) {
  const { data } = await api.get('/api/analytics/subject-curve', { params });
  return data;
}


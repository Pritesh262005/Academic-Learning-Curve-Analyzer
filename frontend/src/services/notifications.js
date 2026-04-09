import api from './api';

export async function listNotifications() {
  const { data } = await api.get('/api/notifications');
  return data;
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/api/notifications/${id}/read`);
  return data;
}

export async function sendNotification(payload) {
  const { data } = await api.post('/api/notifications/send', payload);
  return data;
}

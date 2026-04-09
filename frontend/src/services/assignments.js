import api from './api';

export async function listAssignments() {
  const { data } = await api.get('/api/assignments');
  return data;
}

export async function listAssignmentTasks() {
  const { data } = await api.get('/api/assignments/tasks');
  return data;
}

export async function createAssignmentTask(payload) {
  const { data } = await api.post('/api/assignments/tasks', payload);
  return data;
}

export async function uploadAssignment({ title, subject, description, file, taskId }) {
  const form = new FormData();
  form.append('title', title);
  form.append('subject', subject);
  if (description) form.append('description', description);
  form.append('file', file);
  if (taskId) form.append('taskId', taskId);

  const { data } = await api.post('/api/assignments', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function gradeAssignment(id, payload) {
  const { data } = await api.patch(`/api/assignments/${id}/grade`, payload);
  return data;
}

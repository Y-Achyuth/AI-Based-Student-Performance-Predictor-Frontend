const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE = (configuredApiBase || '/spp/api').replace(/\/+$/, '');

function getApiBase() {
  if (import.meta.env.PROD && !configuredApiBase) {
    throw new Error('Set VITE_API_BASE_URL to the deployed Spring Boot API base URL.');
  }
  return API_BASE;
}

async function request(path, options) {
  const response = await fetch(`${getApiBase()}${path}`, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  }

  return payload;
}

export function getStudents() {
  return request('/students');
}

export function saveAssessment(payload) {
  return request('/assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function saveAttendance(payload) {
  return request('/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function sendMessage(payload) {
  return request('/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

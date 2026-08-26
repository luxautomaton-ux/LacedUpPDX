const STUDIO_BRIDGE_URL = import.meta.env.VITE_STUDIO_BRIDGE_URL || 'http://127.0.0.1:4177/api/bridge'

async function bridgeRequest(path, options) {
  const response = await window.fetch(`${STUDIO_BRIDGE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'The LacedUp Studio bridge is unavailable.')
  return payload
}

export async function getStudioContent() {
  const payload = await bridgeRequest('/public-content')
  return payload.site
}

export function getStudioSnapshot() {
  return bridgeRequest('/public-snapshot')
}

export async function submitVolunteerInterest(volunteer) {
  const payload = await bridgeRequest('/forms/volunteer', {
    method: 'POST',
    body: JSON.stringify({ ...volunteer, source: 'Public website' }),
  })
  return payload.volunteer
}

async function submitPublicForm(path, form) {
  const payload = await bridgeRequest(`/forms/${path}`, {
    method: 'POST',
    body: JSON.stringify(form),
  })
  return payload.form
}

export function submitContactInquiry(form) {
  return submitPublicForm('contact', form)
}

export function submitSneakerListRequest(form) {
  return submitPublicForm('sneaker-list', { ...form, termsAccepted: form.termsAccepted === 'on' || form.termsAccepted === true })
}

export function submitSubscription(form) {
  return submitPublicForm('subscribe', form)
}

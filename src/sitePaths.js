export function siteAsset(value) {
  if (!value || typeof value !== 'string') return value
  if (/^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value

  return `${import.meta.env.BASE_URL}${value.replace(/^\/+/, '')}`
}

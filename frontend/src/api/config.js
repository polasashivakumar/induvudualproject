// Use the environment override when provided, otherwise default to the deployed API origin
const rawApiUrl = import.meta.env.VITE_API_URL || 'https://induvudualproject.onrender.com'

export const API_ORIGIN = rawApiUrl.replace(/\/$/, '')
export const API_BASE_URL = API_ORIGIN.endsWith('/api') ? API_ORIGIN : `${API_ORIGIN}/api`
export const FILE_BASE_URL = API_ORIGIN

// export const API_BASE_URL = 'http://localhost:5400'
export const API_BASE_URL = 'http://192.168.50.199'

// Lead times (days ahead) preselected on the Snow History page; any lead 1..MAX_LEAD_DAYS can be toggled there.
export const HINDCAST_DEFAULT_LEADS = [14, 7]
export const HINDCAST_MAX_LEAD_DAYS = 14
// Predictions at or above this many inches count as a snow event (matches the trainer's SNOW_THRESHOLD).
export const SNOW_EVENT_THRESHOLD = 0.1

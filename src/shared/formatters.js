import { format } from 'date-fns'

export function formatDate3(date) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }
  return new Date(date).toLocaleString(undefined, options)
}

export function formatDate(date) {
  if (!date) return ''
  return format(date, 'M/d/yyyy h:mm:ss a')
}

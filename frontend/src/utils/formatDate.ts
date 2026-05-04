export function formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('fr-FR', options).format(date);
}

export function toLocalIsoDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA').format(date);
}
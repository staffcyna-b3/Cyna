export function formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('fr-FR', options).format(date);
}
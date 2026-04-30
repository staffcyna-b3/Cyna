export type ExtPicture<T = Record<string, unknown>> = Partial<T> & {
  data?: ArrayBuffer | Uint8Array | string;
  base64?: string;
  bytea?: string;
  hex?: string;
  mime?: string;
  url?: string;
};
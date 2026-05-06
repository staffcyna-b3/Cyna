export const HTTP_JSON_CONFIG = {
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
};

export const HTTP_INTERNAL_FO_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'x-internal-secret': process.env.INTERNAL_SECRET ?? '',
  },
  timeout: 10000,
};

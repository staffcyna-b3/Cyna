export const MICROSERVICES = {
  BACKOFFICE: {
    url: process.env.MS_BO_URL || 'http://localhost:3001',
    routes: ['/back-office']
  },
  FRONTOFFICE: {
    url: process.env.MS_FO_URL || 'http://localhost:3002',
    routes: ['/front-office']
  },
  PRODUCT: {
    url: process.env.MS_P_URL || 'http://localhost:3003',
    routes: ['/products']
  }
};

export const getMicroserviceUrl = (path: string): string | null => {
  for (const [, service] of Object.entries(MICROSERVICES)) {
    if (service.routes.some(route => path.startsWith(route))) {
      return service.url;
    }
  }
  return null;
};

export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'ZameenTrace',
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
  mapProvider: process.env.NEXT_PUBLIC_MAP_PROVIDER || 'leaflet',
};

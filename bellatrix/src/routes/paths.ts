// utils

// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  // AUTH
  auth: {
      login: `${ROOTS.AUTH}/login`,
      register: `${ROOTS.AUTH}/register`,
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    apps: {
      root: `${ROOTS.DASHBOARD}/apps`,
      details: (id: string) => `${ROOTS.DASHBOARD}/apps/${id}`,
      versionNew: (id: string) => `${ROOTS.DASHBOARD}/apps/${id}/versions/new`,
      versionDetails: (id: string, versionId: string) => `${ROOTS.DASHBOARD}/apps/${id}/versions/${versionId}`,
      new: `${ROOTS.DASHBOARD}/apps/new`,
    },
    companies: {
      root: `${ROOTS.DASHBOARD}/companies`,
      details: (id: string) => `${ROOTS.DASHBOARD}/companies/${id}`,
      new: `${ROOTS.DASHBOARD}/companies/new`,
    },
    users: {
      root: `${ROOTS.DASHBOARD}/users`,
      new: `${ROOTS.DASHBOARD}/users/new`,
    },
    devices: {
      root: `${ROOTS.DASHBOARD}/devices`,
    },
  }    
};

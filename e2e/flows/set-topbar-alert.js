http.post('http://localhost:4001/__control', {
  body: JSON.stringify({
    alerts: [
      {
        id: 'e2e-topbar-alert',
        message: 'Mock alert from the E2E suite.',
        placement: 'topBar',
        trigger: { type: 'load', delayMs: 0 },
        dismissible: true,
        pageSlugs: [],
        priority: 0,
        actions: [],
      },
    ],
  }),
  headers: { 'Content-Type': 'application/json' },
});

// Minimal content-contract mock server for E2E flows (resilience, navigation,
// alerts). Deliberately dependency-free — scenarios need precise, on-demand
// control over responses that a static fixture server or MSW (in-process only,
// invisible to a real device/simulator) can't give.
//
// Controlled at runtime via POST /__control, called from Maestro flow scripts.
const http = require('http');

const PORT = 4001;

const state = {
  homeMode: 'normal', // 'normal' | 'failing'
  bootstrapContractVersion: '1.1',
  homeNextChangeAt: null, // ISO string, or null for "far future"
  alerts: [], // Alert[], see src/models/alert.ts
};

const send = (res, status, body) => {
  const json = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(json);
};

const bootstrapEnvelope = () => ({
  contractVersion: state.bootstrapContractVersion,
  data: {
    navigation: {
      items: [
        {
          label: 'Home',
          highlighted: false,
          destination: { key: 'home', label: 'Home', path: '/', supportedPlatforms: ['ios', 'android'] },
        },
        {
          label: 'Menu',
          highlighted: false,
          destination: { key: 'menu', label: 'Menu', path: '/menu', supportedPlatforms: ['ios', 'android'] },
        },
      ],
    },
    alerts: state.alerts,
    featureFlags: {},
    promotions: [],
  },
  nextChangeAt: null,
});

const homeEnvelope = () => ({
  contractVersion: '1.1',
  data: {
    layout: [
      {
        blockType: 'textBlock',
        contractVersion: '1.1',
        channels: ['ios', 'android'],
        heading: 'Mock home content',
        body: 'Served by the E2E mock server.',
      },
    ],
  },
  nextChangeAt: state.homeNextChangeAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

const menuEnvelope = () => ({
  contractVersion: '1.1',
  data: {
    layout: [
      {
        blockType: 'textBlock',
        contractVersion: '1.1',
        channels: ['ios', 'android'],
        heading: 'Mock menu content',
        body: 'Served by the E2E mock server.',
      },
    ],
  },
  nextChangeAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

const readBody = req =>
  new Promise(resolve => {
    let raw = '';
    req.on('data', chunk => (raw += chunk));
    req.on('end', () => resolve(raw ? JSON.parse(raw) : {}));
  });

const server = http.createServer(async (req, res) => {
  const path = req.url.split('?')[0];

  if (path === '/api/content/v1/bootstrap') {
    return send(res, 200, bootstrapEnvelope());
  }

  if (path === '/api/content/v1/pages/home') {
    if (state.homeMode === 'failing') {
      return send(res, 503, { error: 'mock: home content unavailable' });
    }
    return send(res, 200, homeEnvelope());
  }

  if (path === '/api/content/v1/pages/menu') {
    return send(res, 200, menuEnvelope());
  }

  if (path === '/__control' && req.method === 'POST') {
    const body = await readBody(req);
    Object.assign(state, body);
    return send(res, 200, state);
  }

  send(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`[e2e-mock-server] listening on http://localhost:${PORT}`);
});

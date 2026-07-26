http.post('http://localhost:4001/__control', {
  body: JSON.stringify({ homeMode: 'normal', bootstrapContractVersion: '1.1', homeNextChangeAt: null }),
  headers: { 'Content-Type': 'application/json' },
});

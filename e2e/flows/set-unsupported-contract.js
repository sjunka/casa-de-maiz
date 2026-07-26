http.post('http://localhost:4001/__control', {
  body: JSON.stringify({ bootstrapContractVersion: '2.0' }),
  headers: { 'Content-Type': 'application/json' },
});

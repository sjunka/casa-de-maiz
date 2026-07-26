http.post('http://localhost:4001/__control', {
  body: JSON.stringify({ homeMode: 'failing' }),
  headers: { 'Content-Type': 'application/json' },
});

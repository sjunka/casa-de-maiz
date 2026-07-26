// nextChangeAt 3s out: long enough for the initial load to land, short enough to
// wait past inside the flow without dragging out the suite.
const nextChangeAt = new Date(Date.now() + 3000).toISOString();
http.post('http://localhost:4001/__control', {
  body: JSON.stringify({ homeMode: 'normal', homeNextChangeAt: nextChangeAt }),
  headers: { 'Content-Type': 'application/json' },
});

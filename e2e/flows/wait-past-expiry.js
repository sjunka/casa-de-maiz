// Maestro has no fixed-duration sleep command; block the host-side script runtime
// instead so the flow genuinely waits past the 3s nextChangeAt set in
// set-home-near-expiry.js, rather than a UI-condition wait that can return early.
const until = Date.now() + 4000;
while (Date.now() < until) {}

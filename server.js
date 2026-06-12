const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Express handles HTTP Range requests out of the box — required for
// smooth video seeking (the hero scrubs currentTime on scroll).
app.use(
  '/assets',
  express.static(path.join(__dirname, 'assets'), {
    maxAge: '30d',
    immutable: true,
  })
);

app.use(express.static(__dirname, { maxAge: '5m' }));

app.listen(port, '0.0.0.0', () => {
  console.log(`Price Offices site listening on ${port}`);
});

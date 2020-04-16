const express = require('express');
const countries = require("./countries.json")
const app = express();
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));

// GET countries
app.get('/api/countries', (_, res) => {
  res.send(countries);
});
/** it's a good practice to have everything that is related to express in one file,
and then everything that is related to the server in another main file. */

// IMPORT APP
const app = require('./app')

// DEFINE THE PORT
const port = 3000;

// START SERVER
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});


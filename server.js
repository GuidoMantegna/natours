/** it's a good practice to have everything that is related to express in one file,
and then everything that is related to the server in another main file. */
// Require dotenv to consume the config.env file
const dotenv = require('dotenv')
/* dotenv has a variable called config on it and then in there we just have
to pass an object to specify the path where our configuration file is located.
It will read our variables from the file and save them into node JS environment variables.*/
dotenv.config({ path: './config.env' })

// IMPORT APP
const app = require('./app')


// This env is set by Express
console.log(app.get('env'))

// DEFINE THE PORT
const port = process.env.PORT || 3000;

// START SERVER
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});


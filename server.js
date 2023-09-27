// 1st we require our mongoose package
const mongoose = require('mongoose');
// Require dotenv to consume the config.env file
const dotenv = require('dotenv');

// UNCAUGHT EXCEPTIONS
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION 💥 Shutting down...');
  console.log(err.name, err.message)
  process.exit(1); // Code one stands for uncaught exception.
})

/* dotenv has a variable called config on it and then in there we just have
to pass an object to specify the path where our configuration file is located.
It will read our variables from the file and save them into node JS environment variables.*/
dotenv.config({ path: './config.env' });

// IMPORT APP
const app = require('.');

// This env is set by Express
console.log(app.get('env'));

// We replace the placeholder <password> with the real password
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

// 2nd we access to mongoose and call the connect method
/* into this connect method, we need to pass in:
1 - our database connection string. 
2 - An object with some options that we need to specify in order to deal with some deprecations warnings */
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful!');
  });

// DEFINE THE PORT
const port = process.env.PORT || 3000;

// START SERVER
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// UNHANDLED REJECTIONS
// Course approach
// process.on('unhandledRejection', err => {
//   console.log(err.name, err.message)
// })

// Documentation approach https://nodejs.org/api/process.html#event-unhandledrejection
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);

  // Application specific logging, throwing an error, or other logic here
  /* If we really have like some problem with the database connection, 
  then our application is not gonna work at all. And so all we can really do here 
  is to shut down our application: what we do is to shutdown gracefully 
  where we first close the server and only then, we shut down the application */
  console.log('UNHANDLED REJECTION 💥 Shutting down...');
  /* by doing server.close, we give the server, basically time to finish all the request 
  that are still pending or being handled at the time, and only after that, 
  the server is then basically killed */
  server.close(() => {
    process.exit(1); // Code one stands for uncaught exception.
  });
});
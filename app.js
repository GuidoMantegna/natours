const fs = require('fs')
const express = require('express');
// This here is a function which upon calling will add a bunch of methods to our app variable here.
const app = express();

/* We can do that because the top-level code is only executed once, which is right after
the application startup. So that simply reads the tours into a variable outside of all 
the a synchronous way.*/
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))

/* It's a good practice to specify the API version (v1) in case you want to do some 
changes to your API without breaking everyone who is still using other version (v2). */
// The callback() is known as 'Route Handler'
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  })
}) 

/* here we create a variable for the port that we are gonna use in app.listen() */
const port = 3000;
/* first we call app.listen() to basically start up a server.
That is a bit similar to what we did before with the http package. 
It receives a port and a callback func. which will be called as soon as the 
server starts listening */
app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})
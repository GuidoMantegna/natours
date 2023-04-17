const fs = require('fs')
const express = require('express');
// This here is a function which upon calling will add a bunch of methods to our app variable here.
const app = express();

/* express.json() here is middleware, and middleware is basically a function that can modify
the incoming request data. It's called middleware because it stands between the request 
and the response. It's just a step that the request goes through while it's being processed. */
app.use(express.json());

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

/* The request object is what holds all the data, all the information, about the request that was done.
If that request contains some data that was sent, that data should be on the request.
Now out of the box, Express does not put that body data on the request, 
and in order to have that data available, we have to use something called middleware. */
app.post('/api/v1/tours', (req, res) => {
  // console.log(req.body)
  /* The first thing we need to do is to figure out the id of the new object.
  Remember when we create a new object, we never specify the id of the object, 
  the database usually takes care of that. A new object usually automatically gets its new id.
  Well in this case, we do not have any database */
  const newId = tours[tours.length -1].id + 1;
  /* that tour will basically be the body that we send plus the new id that we just created.
  So we can use object.assign(), which basically allows us to create a new object 
  by merging two existing objects together. */
  const newTour = Object.assign({id: newId}, req.body)

  tours.push(newTour)

  /* then we have to persist that into the file. To do that use fs.write file.
  We are inside of a call-back function, that is gonna run in the event loop.
  We can never, ever block the event loop. What we're gonna do is to use writeFile 
  and not to Sync in this one. */
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`, 
    JSON.stringify(tours), 
    err => {
      // status 201 stands for created
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      })
  })

  // res.send('DONE!')
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
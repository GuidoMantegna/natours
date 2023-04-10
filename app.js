const express = require('express');
// This here is a function which upon calling will add a bunch of methods to our app variable here.
const app = express();

/* here we get the url (We're just specifying the kind of root URL here and also the 
http method, which is 'get' in this case). So, we define in a callback func. what
do we want to happen when someone hits that URL */
// the callback can accept a couple of arguments, but the most basic ones are 'request' and 'response'
app.get('/', (req, res) => {  
    // we send in the response the status code and whatever we want
    res
      .status(200)
      .json({ // using this json method will automatically set our Content-Yype to application/json
        message: 'Hello from the server side!',
        app: 'Natours'
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
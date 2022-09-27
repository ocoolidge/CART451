//import the Express library
let express = require('express');
const portNumber = 4200;
let app = express(); //make an instance of express
let server = require('http').createServer(app);  // create a server (using the Express framework object)
 
//default route
app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});
 
// make server listen for incoming messages
server.listen(portNumber, function(){
  console.log('listening on port:: '+portNumber);
})

// serving static files
let static = require('node-static'); // for serving static files (i.e. css,js,html...)
// serve anything from this dir ...
app.use(express.static(__dirname + '/public'));
 
//make a route to test page...(put ontop of the first app.use())
app.use('/wsC', wsClientRequestRoute);
//and the function:
function wsClientRequestRoute(req, res, next) {
    res.sendFile(__dirname + '/public/ws.html');
}
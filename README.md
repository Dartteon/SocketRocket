# SocketRocket
A Simple tool to ease testing Socket.io applications.
It is intended to be implemented in integration tests like Mocha + Chai, allowing test cases to easily wait for socket events in a async/await fashion.

### Install

    npm install socket-rocket

### Test

    npm test

### Usage
```javascript
var SocketRocket = require('../socket-await');
var socketURL = 'http://localhost:5000';
var socketRocket = new SocketRocket(socketURL);

//Make SocketRocket (client) emit a series of events, and then wait for specified event ('welcome')
var welcomeMessage = await socketRocket.executeEventsAndWait('welcome', [{event:'enterRoom', data:'hello'}]);

//Run a function, then have SocketRocket client wait for specified event ('greetings')
var greetingsMessage = await socketRocket.executeEventsAndWait('greetings', 
    () => { console.log('This will be printed before the socket responds') });
```

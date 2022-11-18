const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3002;
var moment = require('moment');
var subscribeCount = 0;
const store = require("store2");
const ROOM_ID = 'room1';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client.html');
});

app.get('/server', (req, res) => {
    res.sendFile(__dirname + '/server.html');
});


io.on('connection', (socket) => {
    socket.on('client request', action => {
        try {
            var o = JSON.parse(action);
            if (o && typeof o === "object") {
                let actionType = JSON.parse(action.toLowerCase()).type;

                (actionType == 'subscribe')
                    ? addAction(actionType, 4000, ++subscribeCount)
                    : addToNext(action);
            }
        } catch (e) {
            console.log(e)
            var currentDate = moment().format('MM ddd, YYYY hh:mm:ss a');
            let errorresponse = {type: "error", error: "Bad formatted payload, non JSON", updatedAt: currentDate};
            io.emit('server request', errorresponse);
        }
//action function
        function addAction(action, waitingSeconds, count) {
            setTimeout(() => {
                let currentDate = moment().format('MM ddd, YYYY hh:mm:ss a');
                if (action == 'countsubscribers') response = {type: action, count: count, updatedAt: currentDate};
                else response = {type: action, status: action + 'd', updatedAt: currentDate};
                io.emit('server request', response);
                store('subscribedCount', count);
                //console.log('count',count);
            }, waitingSeconds)
        }
//check actions other than subscribe
        function addToNext(action) {
            var currentDate = moment().format('MM ddd, YYYY hh:mm:ss a');
            let actionType = JSON.parse(action.toLowerCase()).type;
            if (actionType == 'unsubscribe') addAction(actionType, 8000, (subscribeCount > 0) ? --subscribeCount : 0);
            else if (actionType == 'countsubscribers') addAction(actionType, 1000, store('subscribedCount'));
            else {
                let errorresponse = {type: "error", error: "Requested method not implemented", updatedAt: currentDate};
                io.emit('server request', errorresponse);
            }
        }

    });
//heartbeat for every seconds
    setInterval(() => {
        var currentDate = moment().format('MM ddd, YYYY hh:mm:ss a');
        heartResponse = {type: "heartbeat", updatedAt: currentDate};
        io.emit('heartbeat', heartResponse);
    }, 1000)


});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});

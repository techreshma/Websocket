const moment = require("moment/moment");
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client.html');
});
app.get('/server', (req, res) => {
    res.sendFile(__dirname + '/server.html');
});
const ROOM_ID = 'room1';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

io.on('connection', (socket) => {

    socket.on('client request', action => {
        var currentDate = moment().format('MM ddd, YYYY hh:mm:ss a');
        try {
            var o = JSON.parse(action);
            if (o && typeof o === "object") {
                let actionType = JSON.parse(action.toLowerCase()).type;
                if(actionType == 'subscribe')
                {
                    socket.join(ROOM_ID);
                    addAction(actionType,4000)
                }
                else addToNext(action);
            }
        } catch (e) {
            //console.log(e)
            let errorresponse = {type: "error", error: "Bad formatted payload, non JSON", updatedAt: currentDate};
            io.emit('server request', errorresponse);
        }
        //action function
        async function addAction(action, waitingSeconds) {
            await delay(waitingSeconds);
            let currentDate = moment().format('MM ddd, YYYY hh:mm:ss a');
            if (action == 'countsubscribers')
            {
                const socketCount = io.of("/").sockets.size;
                response = {type: action, count: socketCount, updatedAt: currentDate};

            }
            else response = {type: action, status: action + 'd', updatedAt: currentDate};
            io.emit('server request', response);

        }

        //check actions other than subscribe
        async function addToNext(action) {
            let actionType = JSON.parse(action.toLowerCase()).type;
            if (actionType == 'unsubscribe')
            {
                socket.leave(ROOM_ID);
                socket.to(ROOM_ID).emit('user left', socket.id);
                await addAction(actionType,8000)
            }
            else if (actionType == 'countsubscribers') await addAction(actionType, 1000);
            else {
                let currentDate = moment().format('MM ddd, YYYY hh:mm:ss a');
                let errorresponse = {type: "error", error: "Requested method not implemented", updatedAt: currentDate};
                io.emit('server request', errorresponse);
            }
        }
    })



    //heartbeat for every seconds
    setInterval(() => {
        var currentDate = moment().format('MM ddd, YYYY hh:mm:ss a');
        heartResponse = {type: "heartbeat", updatedAt: currentDate};
        io.emit('heartbeat', heartResponse);
    }, 1000)

})


http.listen(PORT, function () {
    console.log('WebSocket App started on PORT: ' + PORT);
});
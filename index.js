const moment = require("moment/moment");
const app = require('express')();
const http = require('http').Server(app);

const PORT = process.env.PORT || 5000;
const ROOM_ID = 'room1';


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const io = require('socket.io')(http);
io.on('connection', (socket) => {
    socket.on('client request', action => {
        const currentDate = moment().format('MM ddd, YYYY hh:mm:ss a');
        try {
            const o = JSON.parse(action);
            if (o && typeof o === "object") {
                let actionType = JSON.parse(action.toLowerCase()).type;
                switch(actionType)
                {
                    case 'subscribe' :
                        socket.join(ROOM_ID);
                        socket.to(ROOM_ID).emit('user joined', socket.id);
                        addAction(actionType,4000);
                        break;
                    case 'unsubscribe'  :
                        socket.leave(ROOM_ID);
                        socket.to(ROOM_ID).emit('user left', socket.id);
                        addAction(actionType,8000);
                        break;
                    case 'countsubscribers' :
                        addAction(actionType,1000);
                        break;
                    default :
                        const errorresponse = {type: "error", error: "Requested method not implemented", updatedAt: currentDate};
                        io.emit('server request', errorresponse);
                        break;
                }
            }
        } catch (e) {
            const errorresponse = {type: "error", error: "Bad formatted payload, non JSON", updatedAt: currentDate};
            io.emit('server request', errorresponse);
        }
        //action function
        async function addAction(action, waitingSeconds) {
            await delay(waitingSeconds);
            let currentDate = moment().format('MM ddd, YYYY hh:mm:ss a');
            let response;
            if (action == 'countsubscribers') {
                const socketCount = io.sockets.adapter.rooms.get(ROOM_ID).size;
                response = {type: action, count: socketCount, updatedAt: currentDate};
            } else response = {type: action, status: action + 'd', updatedAt: currentDate};
            io.emit('server request', response);

        }
    })

    //heartbeat for every seconds
    setInterval(() => {
        const currentDate = moment().format('MM ddd, YYYY hh:mm:ss a');
        let heartResponse = {type: "heartbeat", updatedAt: currentDate};
        io.emit('heartbeat', heartResponse);
    }, 1000)

})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client.html');
});
app.get('/server', (req, res) => {
    res.sendFile(__dirname + '/server.html');
});

http.listen(PORT, function () {
    console.log('WebSocket App started on PORT: ' + PORT);
});
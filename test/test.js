const io = require('socket.io');
const server = io.listen(5000);
const SocketRocket = require('../index');
const chai = require('chai');
const expect = chai.expect;

server.sockets.on('connection', async function (socket) {
    socket.on('hello', function (data) {
        socket.emit('welcome', '[Event : hello] [Emit : welcome] Received Message = ' + data)
    });
});

const emitToAllClients = function () {
    server.sockets.emit('emitToAll', '[Emit: emitToAll] This is a message to all clients');
};

describe("Basic Functionality", function () {
    it('Server socket should respond with welcome', async function () {
        const socketRocket = new SocketRocket('http://localhost:5000');
        const response1 = await socketRocket.executeEventsAndWait('welcome', [{event:'hello', data:'helloData'}]);
        expect(response1).to.be.equal('[Event : hello] [Emit : welcome] Received Message = helloData');
    });

    it('Server socket should emit to all', async function () {
        const socketRocket = new SocketRocket('http://localhost:5000');
        const response = await socketRocket.executeFunctionAndWait('emitToAll',
            () => {
                emitToAllClients();
            });
        expect(response).to.be.equal('[Emit: emitToAll] This is a message to all clients');
    });
});

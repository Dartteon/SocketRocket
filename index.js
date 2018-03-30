const io = require('socket.io-client');
const DEFAULT_WAITING_TIME = 1500;  //1.5s
const DEFAULT_SOCKET_OPTIONS = {};
const CLIENT_SOCKET_CONNECT_INTERVAL = 5;
const waitUntil = require('wait-until');

function SocketRocket (url, options) {
    if (!url || (typeof(url) !== 'string')) {
        throw new Error("No socket URL provided to SocketRocket Constructor");
    }
    this.socketURL = url;

    if (options && options.socketOptions) {
        this.socketOptions = options.socketOptions;
    } else {
        this.socketOptions = DEFAULT_SOCKET_OPTIONS;
    }
    if (options && options.maxWaitingTime) {
        this.maxWaitingTime = options.maxWaitingTime;
    } else {
        this.maxWaitingTime = DEFAULT_WAITING_TIME;
    }

    this.client = io.connect(this.socketURL, this.socketOptions);

    this.ready = false;
    const self = this;
    this.client.on('connect', function(data) {
        self.ready = true;
    });
}

SocketRocket.prototype.executeEventsAndWait = async function (waitForEvent, preEvents) {
    const self = this;
    return this.executeFunctionAndWait (waitForEvent, () => {
        //Wrap calling preEvents into a function and then call executeFunctionAndWait
        if (preEvents) {
            for (let i = 0; i < preEvents.length; i++) {
                self.client.emit(preEvents[i].event, preEvents[i].data);
            }
        }
    });
};

SocketRocket.prototype.executeFunctionAndWait = async function (waitForEvent, func) {
    const self = this;
    const maxTimes = self.maxWaitingTime / CLIENT_SOCKET_CONNECT_INTERVAL;

    return new Promise(
        function (resolve, reject) {
            waitUntil() //Wait till client socket connects
                .interval(CLIENT_SOCKET_CONNECT_INTERVAL)
                .times(maxTimes)
                .condition(function() {
                    return (self.ready);
                })
                .done((waitForConnectionResult) => {
                    if (!waitForConnectionResult) {
                        reject(new Error('Client socket could not connect to server - please check Socket URL'));
                    }
                    if (!self.client) {
                        reject(new Error('Socket Client has not been constructed'));
                    }

                    setTimeout(function(){
                        reject(new Error("Socket response not received '" + waitForEvent + "'"));
                    }, self.maxWaitingTime);

                    self.client.on(waitForEvent, function(data){
                        self.client.off(waitForEvent);
                        resolve(data);
                    });

                    if (func) {
                        func();
                    }
                });
        }
    );
};

SocketRocket.prototype.kill = function () {
    this.client.disconnect();
};

module.exports = SocketRocket;

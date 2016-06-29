"use strict";

// Debug mode for axm
if (process.env.NODE_ENV === 'development') {
    process.env.MODULE_DEBUG = true;
}

var exec = require('child_process').exec;
var pmx = require('pmx');
var pm2 = require('pm2');

var conf = pmx.initModule({}, (err, conf) => {

    var escapeCmd = function (msg) {
        if (/[^A-Za-z0-9_\/:=-]/.test(msg)) {
            msg = "'" + msg.replace(/'/g, "'\\''") + "'";
            msg = msg
                // unduplicate single-quote at the beginning
                .replace(/^(?:'')+/g, '')
                // remove non-escaped single-quote if there are enclosed between 2 escaped
                .replace(/\\'''/g, "\\'");
        }
        return msg;
    };

    var logToLogger = (message) => {
        message = escapeCmd(message);
        exec(`/usr/bin/logger -t nodepm2logs ${ message }`);
    };

    // PM2 log event listener
    pm2.launchBus((err, bus) => {
        bus.on('*', (event, msg) => {
            if (event === 'process:event' && msg.event === 'online') {
                logToLogger(`Process ${ msg.process.name } restarted ${ msg.process.restart_time }`);
                console.log('Process %s restarted %s', msg.process.name, msg.process.restart_time);
            }
            if (event === 'log:err') {
                logToLogger(msg.data);
            }
        });
    });

});

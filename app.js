process.env.MODULE_DEBUG = (process.NODE_ENV == 'production' ? false : true);

var pmx = require('pmx');

var conf = pmx.initModule({}, function (err, conf) {

    var SysLogger = require('ain2');
    var logger = new SysLogger();
    var pm2 = require('pm2');

    pm2.launchBus(function (err, bus) {
        bus.on('*', function (event, msg) {
            if (event == 'process:event' && msg.event == 'online') {
                logger.log('Process %s restarted %s', msg.process.name, msg.process.restart_time, function () {
                    console.log(arguments)
                });
                console.log('Process %s restarted %s', msg.process.name, msg.process.restart_time);
            }
            if (event == 'log:err') {
                logger.error('%s', msg.data);
                console.log(msg.data);
            }
        });
    });

});

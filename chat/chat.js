const fs = require('fs');
const Cryptr = require('cryptr');
const cryptConfig = require('./config.js');
var cryptr = null;
var config = null;
const path = require('path');
const globals = require('./globals');
var join = false;


function init(io) {
    io.on("connection", socket => {
        socket.on("join", password => {
            cryptConfig.decrypt(password, (err, data) => {
                if(err) {
                    io.emit("login", {
                        login: false
                    });
                }
                else {
                    config = data;
                    cryptr = new Cryptr(config.password);


                    io.emit("login", {
                        login: true,
                        nick: config.ego
                    });
                    join = true;
                    
                    saveStatus(config.ego+" dołączył do chatu.", err => {
                        if(err) {
                            io.emit("status", {
                                time: Date.now(),
                                status: "Błąd zapisu historii"
                            });
                        } else {
                            io.emit("status", {
                                time: Date.now(),
                                status: config.ego+" dołączył do chatu."
                            });
                        }
                    });
                }
            });
        });

        socket.on("disconnect", () => {
            disconnect(io, () => {});
        });
        socket.on("message", msg => {
            io.emit("message", {
                time: Date.now(),
                nick: msg.nick,
                curNick: (msg.nick == config.ego ? config.alterEgo : config.ego),
                message: msg.msg,
                isEgo: (msg.nick == config.ego ? true : false)
            });
            
            if(msg.msg) {
                saveMsg(msg, err => {
                    if(err) {
                        io.emit("status", {
                            time: Date.now(),
                            status: "Błąd zapisu historii"
                        });
                    }
                });
            }
        });
    });
}
function disconnect(io, cb) {
    if(join === false) {
        cb();
        return;
    }
    if(config) {
        saveStatus(config.ego+" opuscił chat.", err => {
            if(err) {
                io.emit("status", {
                    time: Date.now(),
                    status: "Błąd zapisu historii"
                });
            } else {
                io.emit("status", {
                    time: Date.now(),
                    status: config.ego+" opuscił chat."
                });
            }
            setTimeout(() => {
                join = false;
                cb();
            },10);
        });
    }
}
function saveMsg(msg, cb) {
    let data = {
        msg: true,
        nick: msg.nick,
        time: Date.now(),
        message: msg.msg,
        isEgo: (msg.nick == config.ego ? true : false)
    }
    let dataString = JSON.stringify(data)+"%end%";
    if(fs.existsSync(path.normalize(__dirname+globals.path+'txt/logs.txt'))) {
        fs.readFile(path.normalize(__dirname+globals.path+'txt/logs.txt'), "utf8", (err, d) => {
            if (err) {
                cb(err);
                return
            }
            if(d !== '') {
                dataString = cryptr.decrypt(d)+dataString;
            }
            
            fs.writeFile(path.normalize(__dirname+globals.path+'txt/logs.txt'), cryptr.encrypt(dataString), function (err) {
                if (err) {
                    cb(err);
                    return
                }
                cb();
            });
        });
        
    } else {
        fs.writeFile(path.normalize(__dirname+globals.path+'txt/logs.txt'), cryptr.encrypt(dataString), function (err) {
            if (err) {
                cb(err);
                return
            }
            cb();
        });
    }
}
function saveStatus(msg, cb) {
    let data = {
        status: true,
        time: Date.now(),
        message: msg
    }
    let dataString = JSON.stringify(data)+"%end%";

    if(fs.existsSync(path.normalize(__dirname+globals.path+'txt/logs.txt'))) {
        fs.readFile(path.normalize(__dirname+globals.path+'txt/logs.txt'), "utf8", (err, d) => {
            if (err) {
                cb(err);
                return
            }
            if(d !== '') {
                dataString = cryptr.decrypt(d)+dataString;
            }
            
            fs.writeFile(path.normalize(__dirname+globals.path+'txt/logs.txt'), cryptr.encrypt(dataString), function (err) {
                if (err) {
                    cb(err);
                    return
                }
                cb();
            });
        });
    } else {
        fs.writeFile(path.normalize(__dirname+globals.path+'txt/logs.txt'), cryptr.encrypt(dataString), function (err) {
            if (err) {
                cb(err);
                return
            }
            cb();
        });
    }
}


module.exports = {
    init: init,
    disconnect: disconnect,
    join: join
}
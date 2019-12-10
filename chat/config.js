const Cryptr = require('cryptr');
const fs = require('fs');
const path = require('path');
const globals = require('./globals');


class CryptoConfig {
    encrypt(obj, cb) {
        let pass = obj.password;
        let cryptr = new Cryptr(pass);

        if(fs.existsSync(path.normalize(__dirname+globals.path+'txt/config.txt')) && obj.newPassword) {
            this.decrypt(pass, (err, data) => {
                if(err) {
                    cb(err);
                } else {
                    if(fs.existsSync(path.normalize(__dirname+globals.path+'txt/logs.txt'))) {
                        let dataString;
                        fs.readFile(path.normalize(__dirname+globals.path+'txt/logs.txt'), "utf8", (err, d) => {
                            if (err) {
                                cb(err);
                            }
                            dataString = cryptr.decrypt(d);
                            
                            let cryptr2 = new Cryptr(obj.newPassword);
                            
                            fs.writeFile(path.normalize(__dirname+globals.path+'txt/logs.txt'), cryptr2.encrypt(dataString), err => {
                                if (err) {
                                    cb(err);
                                }
                                data.password = obj.newPassword;
                                
                                let objString = JSON.stringify(data);
                                let objCrypt = cryptr2.encrypt(objString);

                                fs.writeFile(path.normalize(__dirname+globals.path+'txt/config.txt'), objCrypt, err => {
                                    if(err) {
                                        cb(err);
                                    } else {
                                        cb();
                                    }
                                });
                            });
                        });
                    }
                }
            });
        } else {
            let objString = JSON.stringify(obj);
            let objCrypt = cryptr.encrypt(objString);
            fs.writeFile(path.normalize(__dirname+globals.path+'txt/config.txt'), objCrypt, err => {
                if(err) {
                    cb(err);
                } else {
                    cb();
                }
            });
        }
    }
    decrypt(pass, cb) {
        let cryptr = new Cryptr(pass);
        fs.readFile(path.normalize(__dirname+globals.path+'txt/config.txt'), "utf8", (err, data) => {
            if(err) {
                cb(err, null);
                return;
            } else {
                let objCrypt = cryptr.decrypt(data);
                let objJSON;
                try {
                    objJSON = JSON.parse(objCrypt);
                } catch(err) {
                    cb(err, null);
                    return;
                }
                cb(null, objJSON);
            }
        });
    }
}

const cryptConfig = new CryptoConfig();

module.exports = cryptConfig;
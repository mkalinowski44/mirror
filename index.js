const electron = require("electron");
const express = require("express");
const expressApp = express();
const server = require("http").Server(expressApp);
const hbs = require("express-handlebars");
const chat = require("./chat");
const router = require("./chat/router");
var bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const globals = require('./chat/globals');

const {app, BrowserWindow} = electron;

// process.env.NODE_ENV = 'dev';

let mainWindow;

const io = require("socket.io")(server);

expressApp.engine("handlebars", hbs({defaultLayout: "main"}));
expressApp.set("view engine", "handlebars");

expressApp.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}));
expressApp.use( express.static("public") );
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }))
expressApp.use(router);

// Listen for app to be ready
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        minHeight: 500,
        minWidth: 600,
        frame: false,
        backgroundColor: '#000000'
    });
    mainWindow.loadURL('http://localhost:'+globals.port);

    mainWindow.on('closed', () => {
        chat.disconnect(io, () => {
            app.quit();
        });
    });
});

server.listen(globals.port, function() {

    console.log("Serwer został uruchomiony pod adresem http://localhost:"+globals.port);

});

chat.init(io);
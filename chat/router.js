const express = require('express');
const fs = require("fs");
const cryptConfig = require('./config.js');
const Cryptr = require('cryptr');
const path = require('path');
var cryptr = null;
var router = express.Router();
const globals = require('./globals');



router.get("/", function(req, res) {

    res.render("home", {
        title: "MIRROR",
        port: `<script type="text/javascript">const port=${globals.port};</script>`,
        style: getStyle(req.session),
        styles: ["main.css"],
        scripts: [
            "jquery.js",
            "handlebars.js",
            "socket.io.js",
            "chat.js",
            "render.js"
        ]
    });

});

router.get('/help', (req, res) => {
    res.render('help', {
        title: "MIRROR HELP",
        port: `<script type="text/javascript">const port=${globals.port};</script>`,
        style: getStyle(req.session),
        styles: ["main.css"],
        scripts: [
            "jquery.js",
            "render.js"
        ]

    })
});
router.get('/info', (req, res) => {
    res.render('info', {
        title: "MIRROR INFO",
        port: `<script type="text/javascript">const port=${globals.port};</script>`,
        version: globals.version,
        style: getStyle(req.session),
        styles: ["main.css"],
        scripts: [
            "jquery.js",
            "render.js"
        ]

    })
});

const initfn = {
    renderTemplate: function(req, res, check) {
        res.render('init', {
            title: "Inicjalizacja ustawień",
            port: `<script type="text/javascript">const port=${globals.port};</script>`,
            style: getStyle(req.session),
            check: check,
            styles: ["main.css"],
            scripts: [
                "jquery.js",
                "render.js"
            ]
        });
    },
    showError: function(req, res) {
        this.renderTemplate(req, res, false);
    },
    showSuccess: function(req, res) {
        this.renderTemplate(req, res, true);
    },
    cryptConfig: function(req, res, config) {
        cryptConfig.encrypt(config, err => {
            if(err) {
                this.showError(req, res);
            } else {
                this.showSuccess(req, res);
            }
        });
    }
}

router.post('/init', (req, res) => {
    let config;
    if(req.body.password) {
        if(fs.existsSync(path.normalize(__dirname+globals.path+'txt/config.txt'))) {
            cryptConfig.decrypt(req.body.password, (err, data) => {
                if(err) {
                    initfn.showError(req, res);
                } else {
                    config = {
                        password: req.body.password,
                        ego: (req.body.ego ? req.body.ego : data.ego),
                        alterEgo: (req.body.alterEgo ? req.body.alterEgo : data.alterEgo),
                        egoColor: (req.body.egoColor ? req.body.egoColor : data.egoColor),
                        alterEgoColor: (req.body.alterEgoColor ? req.body.alterEgoColor : data.alterEgoColor)
                    }
                    if(req.body.newPassword) {
                        config.newPassword = req.body.newPassword;
                    }
                    let color = {
                        egoColor: config.egoColor,
                        alterEgoColor: config.alterEgoColor
                    }
                    req.session.color = color;
                    
                    initfn.cryptConfig(req, res, config);
                }
            });
        } else {
            if(!req.body.ego ||
            !req.body.alterEgo ||
            !req.body.egoColor ||
            !req.body.alterEgoColor) {
                
                initfn.showError(req, res);
                return;
            } else {
                config = {
                    password: req.body.password,
                    ego: req.body.ego,
                    alterEgo: req.body.alterEgo,
                    egoColor: req.body.egoColor,
                    alterEgoColor: req.body.alterEgoColor
                }
                
                let color = {
                    egoColor: config.egoColor,
                    alterEgoColor: config.alterEgoColor
                }
                req.session.color = color;
                
                initfn.cryptConfig(req, res, config);
            }
        }
    } else {
        initfn.showError(req, res);
    }
    
});

router.post("/color", (req, res) => {
    if(req.body.password) {
        if(fs.existsSync(path.normalize(__dirname+globals.path+'txt/config.txt'))) {
            cryptConfig.decrypt(req.body.password, (err, data) => {
                if(!err) {
                    let color = {
                        egoColor: data.egoColor,
                        alterEgoColor: data.alterEgoColor
                    }
                    req.session.color = color;

                    res.end("true");
                } else {
                    res.end("false");
                }
            });
        }
    } else {
        res.end("false");
    }
});

router.get("/history", (req, res) => {
    res.render("historyLogin", {
        title: "MIRROR HISTORY",
        port: `<script type="text/javascript">const port=${globals.port};</script>`,
        style: getStyle(req.session),
        styles: ["main.css"],
        scripts: [
            "jquery.js",
            "render.js"
        ]
    });
});

router.get("/config", (req, res) => {
    if(fs.existsSync(path.normalize(__dirname+globals.path+'txt/config.txt'))) {
        res.render("configLogin", {
            title: "MIRROR CONFIG",
            port: `<script type="text/javascript">const port=${globals.port};</script>`,
            style: getStyle(req.session),
            styles: ["main.css"],
            scripts: [
                "jquery.js",
                "render.js"
            ]
        });
    } else {
        data = {
            ego: "twoje ego",
            alterEgo: "twoje alterego",
            egoColor: "twój kolor",
            alterEgoColor: "kolor twojego alterego"
        }
        res.render("config", {
            title: "MIRROR CONFIG",
            style: getStyle(req.session),
            data: data,
            styles: ["main.css"],
            scripts: [
                "jquery.js",
                "render.js"
            ]
        });
    }
});

const historyfn = {
    showError: function(req, res) {
        res.render("historyLogin", {
            title: "MIRROR HISTORY",
            port: `<script type="text/javascript">const port=${globals.port};</script>`,
            style: getStyle(req.session),
            err: true,
            styles: ["main.css"],
            scripts: [
                "jquery.js",
                "render.js"
            ]
        });
    },
    showSuccess: function(req, res, data) {
        data.forEach(element => {
            element.time = this.formatDate(element.time);
        });
        res.render("history", {
            title: "MIRROR HISTORY",
            port: `<script type="text/javascript">const port=${globals.port};</script>`,
            style: getStyle(req.session),
            data: data,
            styles: ["main.css"],
            scripts: [
                "jquery.js",
                "render.js"
            ]
        });
    },
    formatDate: function(time) {
        var date = new Date(time),
        year = date.getFullYear(),
        month = date.getMonth(),
        day = date.getDate();
        hours = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds();

        return  year+"."+
                (month < 10 ? "0" + month : month) + "." +
                (day < 10 ? "0" + day : day)+" "+
                (hours < 10 ? "0" + hours : hours) + ":" +
                (minutes < 10 ? "0" + minutes : minutes) + ":" +
                (seconds < 10 ? "0" + seconds : seconds);
    }
}

router.post("/history", (req, res) => {
    cryptConfig.decrypt(req.body.password, (err, config) => {
        if(err) {
            historyfn.showError(req, res);
        } else {
            cryptr = new Cryptr(config.password);
            if(req.body.password === config.password) {
                let color = {
                    egoColor: config.egoColor,
                    alterEgoColor: config.alterEgoColor
                }
                req.session.color = color;

                let data = new Array();
                if(fs.existsSync(path.normalize(__dirname+globals.path+'txt/logs.txt'))) {
                    fs.readFile(path.normalize(__dirname+globals.path+'txt/logs.txt'), "utf8", (err, d) => {
                        if (!err || d !== '') {
                            dataTmp = cryptr.decrypt(d).split('%end%');
                            dataTmp.forEach(element => {
                                if(element) {
                                    let obj = JSON.parse(element);
                                    data.push(obj);
                                }
                            });
                        }
                        historyfn.showSuccess(req, res, data);
                    });
                } else {
                    historyfn.showSuccess(req, res, data);
                }
            } else {
                historyfn.showError(req, res);
            }
        }
    });
});

const configfn = {
    showError: function(req, res) {
        res.render("configLogin", {
            title: "MIRROR CONFIG",
            port: `<script type="text/javascript">const port=${globals.port};</script>`,
            style: getStyle(req.session),
            err: true,
            styles: ["main.css"],
            scripts: [
                "jquery.js",
                "render.js"
            ]
        });
    },
    showSuccess: function(req, res, data) {
        res.render("config", {
            title: "MIRROR CONFIG",
            port: `<script type="text/javascript">const port=${globals.port};</script>`,
            style: getStyle(req.session),
            data: data,
            styles: ["main.css"],
            scripts: [
                "jquery.js",
                "render.js"
            ]
        });
    }
}

router.post("/config", (req, res) => {
    cryptConfig.decrypt(req.body.password, (err, config) => {
        
        if(err) {
            configfn.showError(req, res);
        } else {
            cryptr = new Cryptr(config.password);
            if(req.body.password === config.password) {
                let color = {
                    egoColor: config.egoColor,
                    alterEgoColor: config.alterEgoColor
                }
                req.session.color = color;

                let data = {};
                if(fs.existsSync(path.normalize(__dirname+globals.path+'txt/config.txt'))) {
                    fs.readFile(path.normalize(__dirname+globals.path+'txt/config.txt'), "utf8", (err, d) => {
                        if (!err || d !== '') {
                            data = cryptr.decrypt(d);
                            data = JSON.parse(data);
                        }
                        configfn.showSuccess(req, res, data);
                    });
                } else {
                    configfn.showSuccess(req, res, data);
                }
            } else {
                configfn.showError(req, res);
            }
        }
    });
});

function getStyle(session) {
    if(session.color) {
        let color = {
            egoColor: normalize(session.color.egoColor),
            alterEgoColor: normalize(session.color.alterEgoColor),
        }

        return `
        <style>
            body,
            #chat-text,
            button, a,
            .chatRow input {
                color: ${color.egoColor};
            }
            #wrapper,
            button, a,
            button:before, a:before,
            button:after, a:after,
            .chatRow fieldset,
            .chatRow fieldset:before,
            .chatRow fieldset:after,
            .chatRow fieldset legend,
            .chatRow fieldset legend:after, .chatRow fieldset legend:before,
            .statusRow,
            ::-webkit-scrollbar-thumb {
                border-color: ${color.egoColor};
            }
            body {
                box-shadow: inset 0 0 0 1px ${color.egoColor};
            }
            ::-webkit-scrollbar-thumb:hover {
                background-color: ${rgba(color.egoColor, '0.1')};
            }
            button:hover, a:hover {
                background-color: ${rgba(color.egoColor, '0.15')};
            }

            .chatRow.accent,
            .chatRow.accent fieldset input,
            .chatRow.accent fieldset textarea {
                color: ${color.alterEgoColor} !important;
            }
            .chatRow.accent fieldset,
            .chatRow.accent fieldset:before,
            .chatRow.accent fieldset:after,
            .chatRow.accent fieldset legend,
            .chatRow.accent fieldset legend:after,
            .chatRow.accent fieldset legend:before {
                border-color: ${color.alterEgoColor};
            }
        </style>
        `;
    } else {
        return false;
    }
}
function normalize(color) {
    if(color.slice(0,1) == '#') {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        return result ? 
            `rgb(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)})`
         : color;
    }
    else if(color.slice(0,3) == 'rgb') {
        return color;
    } else {
        switch(color) {
            case 'aliceblue': return 'rgb(240,248,255)';
            case 'antiquewhite': return 'rgb(250,235,215)';
            case 'aqua': return 'rgb(0,255,255)';
            case 'aquamarine': return 'rgb(27,255,212)';
            case 'azure': return 'rgb(240,255,255)';
            case 'beige': return 'rgb(245,245,220)';
            case 'bisque': return 'rgb(255,228,196)';
            case 'black': return 'rgb(0,0,0)';
            case 'blanchedalmond': return 'rgb(255,235,205)';
            case 'blue': return 'rgb(0,0,255)';
            case 'blueviolet': return 'rgb(138,43,226)';
            case 'brown': return 'rgb(165,42,42)';
            case 'burlywood': return 'rgb(222,184,135)';
            case 'cadetblue': return 'rgb(95,158,160)';
            case 'chartreuse': return 'rgb(127,255,0)';
            case 'chocolate': return 'rgb(210,105,30)';
            case 'coral': return 'rgb(255,127,80)';
            case 'cornflowerblue': return 'rgb(100,149,237)';
            case 'cornsilk': return 'rgb(255,248,220)';
            case 'crimson': return 'rgb(220,20,60)';
            case 'cyan': return 'rgb(0,255,255)';
            case 'darkblue': return 'rgb(0,0,139)';
            case 'darkcyan': return 'rgb(0,139,139)';
            case 'darkgoldenrod': return 'rgb(184,134,11)';
            case 'darkgray': return 'rgb(169,169,169)';
            case 'darkgreen': return 'rgb(0,100,0)';
            case 'darkgrey': return 'rgb(169,169,169)';
            case 'darkkhaki': return 'rgb(189,183,107)';
            case 'darkmagenta': return 'rgb(139,0,139)';
            case 'darkolivegreen': return 'rgb(85,107,47)';
            case 'darkorange': return 'rgb(255,140,0)';
            case 'darkorchid': return 'rgb(153,50,204)';
            case 'darkred': return 'rgb(139,0,0)';
            case 'darksalmon': return 'rgb(233,150,122)';
            case 'darkseagreen': return 'rgb(143,188,143)';
            case 'darkslateblue': return 'rgb(72,61,139)';
            case 'darkslategray': return 'rgb(47,79,79)';
            case 'darkslategrey': return 'rgb(47,79,79)';
            case 'darkturquoise': return 'rgb(0,206,209)';
            case 'darkviolet': return 'rgb(148,0,211)';
            case 'deeppink': return 'rgb(255,20,147)';
            case 'deepskyblue': return 'rgb(0,191,255)';
            case 'dimgray': return 'rgb(105,105,105)';
            case 'dimgrey': return 'rgb(105,105,105)';
            case 'dodgerblue': return 'rgb(30,144,255)';
            case 'firebrick': return 'rgb(178,34,34)';
            case 'floralwhite': return 'rgb(255,250,240)';
            case 'forestgreen': return 'rgb(34,139,34)';
            case 'fuchsia': return 'rgb(255,0,255)';
            case 'gainsboro': return 'rgb(220,220,220)';
            case 'ghostwhite': return 'rgb(248,248,255)';
            case 'gold': return 'rgb(255,215,0)';
            case 'goldenrod': return 'rgb(218,165,32)';
            case 'gray': return 'rgb(128,128,128)';
            case 'green': return 'rgb(0,128,0)';
            case 'greenyellow': return 'rgb(173,255,47)';
            case 'grey': return 'rgb(128,128,128)';
            case 'honeydew': return 'rgb(240,255,240)';
            case 'hotpink': return 'rgb(255,105,180)';
            case 'indianred': return 'rgb(205,92,92)';
            case 'indigo': return 'rgb(75,0,130)';
            case 'ivory': return 'rgb(255,255,240)';
            case 'khaki': return 'rgb(240,230,140)';
            case 'lavender': return 'rgb(230,230,250)';
            case 'lavenderblush': return 'rgb(255,240,245)';
            case 'lawngreen': return 'rgb(124,252,0)';
            case 'lemonchiffon': return 'rgb(255,250,205)';
            case 'lightblue': return 'rgb(173,216,230)';
            case 'lightcoral': return 'rgb(240,128,128)';
            case 'lightcyan': return 'rgb(224,255,255)';
            case 'lightgoldenrodyellow': return 'rgb(250,250,210)';
            case 'lightgray': return 'rgb(211,211,211)';
            case 'lightgreen': return 'rgb(144,238,144)';
            case 'lightgrey': return 'rgb(211,211,211)';
            case 'lightpink': return 'rgb(255,182,193)';
            case 'lightsalmon': return 'rgb(255,160,122)';
            case 'lightseagreen': return 'rgb(32,178,170)';
            case 'lightskyblue': return 'rgb(135,206,250)';
            case 'lightslategray': return 'rgb(119,136,153)';
            case 'lightsteelblue': return 'rgb(176,196,222)';
            case 'lightyellow': return 'rgb(255,255,224)';
            case 'lime': return 'rgb(0,255,0)';
            case 'limegreen': return 'rgb(50,205,50)';
            case 'linen': return 'rgb(250,240,230)';
            case 'magenta': return 'rgb(255,0,255)';
            case 'maroon': return 'rgb(128,0,0)';
            case 'mediumaquamarine': return 'rgb(102,205,170)';
            case 'mediumblue': return 'rgb(0,0,205)';
            case 'mediumorchid': return 'rgb(186,85,211)';
            case 'mediumpurple': return 'rgb(147,112,219)';
            case 'mediumseagreen': return 'rgb(60,179,113)';
            case 'mediumslateblue': return 'rgb(123,104,238)';
            case 'mediumspringgreen': return 'rgb(0,250,154)';
            case 'mediumturquoise': return 'rgb(72,209,204)';
            case 'mediumvioletred': return 'rgb(199,21,133)';
            case 'midnightblue': return 'rgb(25,25,112)';
            case 'mintcream': return 'rgb(245,255,250)';
            case 'mistyrose': return 'rgb(255,228,225)';
            case 'moccasin': return 'rgb(255,228,181)';
            case 'navajowhite': return 'rgb(255,222,173)';
            case 'navy': return 'rgb(0,0,128)';
            case 'oldlace': return 'rgb(253,245,230)';
            case 'olive': return 'rgb(128,128,0)';
            case 'olivedrab': return 'rgb(107,142,35)';
            case 'orange': return 'rgb(255,165,0)';
            case 'orangered': return 'rgb(255,69,0)';
            case 'orchid': return 'rgb(218,112,214)';
            case 'palegoldenrod': return 'rgb(238,232,170)';
            case 'palegreen': return 'rgb(152,251,152)';
            case 'paleturquoise': return 'rgb(175,238,238)';
            case 'palevioletred': return 'rgb(219,112,147)';
            case 'papayawhip': return 'rgb(255,239,213)';
            case 'peachpuff': return 'rgb(255,218,185)';
            case 'peru': return 'rgb(205,133,63)';
            case 'pink': return 'rgb(255,192,203)';
            case 'plum': return 'rgb(221,160,221)';
            case 'powderblue': return 'rgb(176,224,230)';
            case 'purple': return 'rgb(128,0,128)';
            case 'red': return 'rgb(255,0,0)';
            case 'rosybrown': return 'rgb(188,143,143)';
            case 'royalblue': return 'rgb(65,105,225)';
            case 'saddlebrown': return 'rgb(139,69,19)';
            case 'salmon': return 'rgb(250,128,114)';
            case 'sandybrown': return 'rgb(244,164,96)';
            case 'seagreen': return 'rgb(46,139,87)';
            case 'seashell': return 'rgb(255,245,238)';
            case 'sienna': return 'rgb(160,82,45)';
            case 'silver': return 'rgb(192,192,192)';
            case 'skyblue': return 'rgb(135,206,235)';
            case 'slateblue': return 'rgb(106,90,205)';
            case 'slategray': return 'rgb(112,128,144)';
            case 'slategrey': return 'rgb(112,128,144)';
            case 'snow': return 'rgb(255,250,250)';
            case 'springgreen': return 'rgb(0,255,127)';
            case 'steelblue': return 'rgb(70,130,180)';
            case 'tan': return 'rgb(210,180,140)';
            case 'teal': return 'rgb(0,128,128)';
            case 'thistle': return 'rgb(216,191,216)';
            case 'tomato': return 'rgb(255,99,71)';
            case 'turquoise': return 'rgb(64,224,208)';
            case 'violet': return 'rgb(238,130,238)';
            case 'wheat': return 'rgb(245,222,179)';
            case 'white': return 'rgb(255,255,255)';
            case 'whitesmoke': return 'rgb(245,245,245)';
            case 'yellow': return 'rgb(255,255,0)';
            case 'yellowgreen': return 'rgb(154,205,50)';
            default: return color;
        }
    }
}
function rgba(color, transparency) {
    let tmpColor = color.replace(')', ','+transparency+')');
    return tmpColor.replace('rgb', 'rgba');
}

module.exports = router;
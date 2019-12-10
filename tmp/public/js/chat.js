(function() {
    var socket = io.connect("http://127.0.0.1:"+port),
        joined = false,
        nick = '';
    var joinForm = $("#join-form"),
        pass = $("#password"),
        nickLabel = $("#nickLabel"),
        passRow = $("#passwordRow"),
        messageRow = $("#messageRow"),
        message = $("#message"),
        chatForm = $("#chat-form"),
        chatWindow = $("#chatWindow"),
        chatMessage = $("#chat-text");
        chatStatusTpl = Handlebars.compile($("#chat-status-template").html());
        chatMessageTpl = Handlebars.compile($("#chat-message-template").html());

    joinForm.on("submit", function(e) {
        e.preventDefault();

        var password = pass.val();

        if(password === "") {
            passRow.addClass("invalid");
        } else {
            socket.emit("join", password);
            $.ajax({
                method: "POST",
                url: "/color",
                data: {password: password}
            })
            .done(msg => {
                if(msg == "false") {
                    console.warn('Nie udało się ustawić koloru');
                }
            });
        }

    });
    chatMessage.focusin(() => {
        message.addClass('active');
    })
    .focusout(() => {
        message.removeClass('active');
    });
    chatForm.on("submit", function(e) {

        e.preventDefault();

        var message = {
            msg: chatMessage.val(),
            nick: nick
        }

        if(message !== "") {
            socket.emit("message", message);
            setTimeout(() => {
                chatMessage.val("");
            }, 0);
        }

    });

    socket.on("status", data => {
        if(!joined) return;

        var html = chatStatusTpl({
            status: data.status,
            time: formatDate(data.time)
        });
        chatWindow.append(html);
        scrollToBottom();
    });
    socket.on("login", data => {
        if(data.login) {
            nick = data.nick;

            nickLabel.html(nick);

            passRow.removeClass("invalid");

            joinForm.css('display', 'none');
            chatForm.css('display', 'flex');

            joined = true;
        } else {
            passRow.addClass("invalid");
        }
    });

    socket.on("message", msg => {
        if(!joined) return;
        nick = msg.curNick;
        nickLabel.html(nick);
        if(msg.isEgo) {
            messageRow.addClass('accent');
        } else {
            messageRow.removeClass('accent');
        }
        if(msg.message !== "") {
            var html = chatMessageTpl({
                message: msg.message,
                nick: msg.nick,
                time: formatDate(msg.time),
                isEgo: msg.isEgo
            });
            chatWindow.append(html);
            scrollToBottom();
        }
    })

    function formatDate(time) {
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

    function scrollToBottom() {
        setTimeout(() => {
            chatWindow.animate({ scrollTop: chatWindow.prop("scrollHeight") }, 500);
        },100);
    }

   chatMessage.keypress(function (e) {
        var key = e.which;
        if(key == 13 && !e.shiftKey) {
           chatForm.submit();
        }
       });   
})();
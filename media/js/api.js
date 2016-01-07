/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, next*/
/* io.sockets.emit()  <= pour tout le monde
   socket.broadcast.emit() <= pour tout le monde sauf current
   socket.emit <= pour current
*/
var http, path, express, app, server, io, arrayUser, arrayChanel, i, userDuplicate, channelMatch, j, reponse, k, a, getChannel, b, channels, c;
channels = [];
arrayUser = [];
arrayChanel = [{channelName: "default", users: []},{channelName: "studentFirstYear", users: []},{channelName: "studentSecondYear", users: []},{channelName: "pangolin", users: []},{channelName: "game", users: []},{channelName: "job", users: []},{channelName: "campus", users: []}];
http = require('http');
path = require('path');
express = require('express');
app = express();
app.use(express.static(path.resolve(__dirname + '/../../media')));
server = http.Server(app);
io = require('socket.io')(server);
server.listen(1234);
app.get('/', function (requete, response) {
    "use strict";
    response.sendFile(path.resolve(__dirname + '/../../views/index.html'));
});

function userExist (nickname) {
    "use strict";
    for (a = 0; a < arrayUser.length; a = a + 1) {
        if (arrayUser[a].nickname === nickname) {
            return true;
            break;
        }
    }
    return false;
}
io.on('connection', function (socket) {
    "use strict";
    console.log('a user is connected');
    for (c = 0; c < arrayChanel.length; c = c + 1) {
        channels.push(arrayChanel[c].channelName);
    }
    socket.emit("list channel", {error: null, data: channels});
    channels = [];
    socket.on('user connection', function (dataUserConnection) {
        userDuplicate = false;
        channelMatch = false;
        reponse = "";
        for (i = 0; i < arrayUser.length; i = i + 1) {
            if (arrayUser[i].nickname === dataUserConnection.nickname) {
                userDuplicate = true;
                break;
            }
        }
        if (dataUserConnection.channel === "") {
            dataUserConnection.channel = "default";
            channelMatch = true;
        } else {
            for (j = 0; j < arrayChanel.length; j = j + 1) {
                if (arrayChanel[j].channelName === dataUserConnection.channel) {
                    channelMatch = true;
                    break;
                }
            }
        }
        if (userDuplicate === true) {
            reponse = {error: "nickname already taken", data: null};
        } else if (channelMatch === true) {
            arrayUser.push({nickname: dataUserConnection.nickname, remember: dataUserConnection.remember, channel: dataUserConnection.channel});
            for (k = 0; k < arrayChanel.length; k = k + 1) {
                if (arrayChanel[k].channelName === dataUserConnection.channel) {
                    arrayChanel[k].users.push(dataUserConnection.nickname);
                    break;
                }
            }
            reponse = {error: null, data: {nickname: dataUserConnection.nickname, channel: dataUserConnection.channel, userLength: arrayUser.length}};
            socket.emit('user connection', reponse);
            socket.broadcast.emit('new user', {error: null, data: {userLength: arrayUser.length, nickname: dataUserConnection.nickname, channel: dataUserConnection.channel}});
            for (b = 0; b < arrayChanel.length; b = b + 1) {
                if (arrayChanel[b].channelName === dataUserConnection.channel) {
                    getChannel = {channelName: arrayChanel[b].channelName};
                    break;
                }
            }
            socket.emit('get channel', {error: null, data: getChannel});
        } else {
            reponse = {error: "channel not found, you go in channel default", data: null};
        }
        socket.emit('user connection', reponse);
    });
    socket.on('all channel', function () {
        socket.emit('all channel', {error: null, data: arrayChanel});
    });
    socket.on('disconnect', function (){
        console.log('a user is disconnected');
    });
});
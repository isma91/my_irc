/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, next*/
/* io.sockets.emit()  <= pour tout le monde
   socket.broadcast.emit() <= pour tout le monde sauf current
   socket.emit <= pour current
*/
var http, path, express, app, server, io, arrayUser, arrayChanel, i, userDuplicate, channelMatch, j, reponse, k, a, getChannel, b, channels, c, d, arrayShortcuts, e, f, visitorCount;
visitorCount = 0;
channels = [];
arrayUser = [];
arrayChanel = [{channelName: "default", users: []},{channelName: "studentFirstYear", users: []},{channelName: "studentSecondYear", users: []},{channelName: "pangolin", users: []},{channelName: "game", users: []},{channelName: "job", users: []},{channelName: "campus", users: []}];
arrayShortcuts = [{name: "/allShortcuts", pattern: "/allShortcuts", description: "display all keyboard shortcuts"}, {name: "/msg", pattern: "/msg [nickname]:[message]", description: "send personnal message to [nickname], all user in the channel if nickname is empty"}, {name: "/nick", pattern: "/nick [nickname]", description: "change your nickname to [nickname]"}, {name: "/list", pattern: "/list [channelName]", description: "list all channel, displays only channels containing [channelName] if it is specified"}, {name: "/join", pattern: "/join [channelName]", description: "leave your current channel and join channel [channelName]"}, {name: "/part", pattern: "/part", description: "leave your current channel, you can't send message to people when you leave all your channel but you can still send personnal message"}, {name: "/users", pattern: "/users", description: "list all users who are in your current channel"}, {name: "/addChannel", pattern: "/addChannel [channelName]", description: "Add a channel and you go in directly"}];
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
function channelExist (channel) {
    "use strict";
    for (d = 0; d < arrayChanel.length; d = d + 1) {
        if (arrayChanel[d].channelName === channel) {
            return true;
            break;
        }
    }
    return false;
}
function userCheckLeave (nickname) {
	"use strict";
	var i,j;
	for (i = 0; i < arrayChanel.length; i = i + 1) {
		for (j = 0; j < arrayChanel[i].users.length; j = j + 1) {
			if (arrayChanel[i].users[j] === nickname) {
				return false;
				break;
			}
		}
	}
	return true;
}
function nicknameAddInChannel (nickname, channel, fromChannel) {
    "use strict";
    var nicknameInChannel;
    nicknameInChannel = "false";
    if (userExist(nickname) === true) {
        if (channelExist(fromChannel) === true || fromChannel === "") {
            if (channelExist(channel) === true) {
                for (e = 0; e < arrayChanel.length; e = e + 1) {
                    if (arrayChanel[e].channelName === channel) {
                        for (f = 0; f < arrayChanel[e].users.length; f = f + 1) {
                            if (arrayChanel[e].users[f] === nickname) {
                                nicknameInChannel = "true";
                                break;
                            }
                        }
                        if (nicknameInChannel === "true") {
                            return {error: null, nickname: nickname, channel: channel, fromChannel: fromChannel};
                        } else {
                            arrayChanel[e].users.push(nickname);
                            return {error: null, nickname: nickname, channel: channel, fromChannel: fromChannel};
                        }
                    }
                }
            } else {
                return {error: 'channel not found !!', data: {channel: channel, nickname: nickname}};
            }
        } else {
            return {error: 'from channel not found !!', data: null};
        }
    } else {
        return {error: 'nickname not found !!', data: null};
    }
}
function changeNickname (oldNickname, newNickname) {
    "use strict";
    var i, j, k;
    for (i = 0; i < arrayUser.length; i = i + 1) {
        if (arrayUser[i].nickname === oldNickname) {
            arrayUser[i].nickname = newNickname;
            break;
        }
    }
    for (j = 0; j < arrayChanel.length; j = j + 1) {
        for (k = 0; k < arrayChanel[j].users.length; k = k + 1) {
            if (arrayChanel[j].users[k] === oldNickname) {
                arrayChanel[j].users[k] = newNickname;
                break;
            }
        }
    }
}
function listChannel (channelName) {
    "use strict";
    var listChannel, i, regex, j;
    listChannel = [];
    if (channelName === "") {
        for (i = 0; i < arrayChanel.length; i = i + 1) {
            listChannel.push(arrayChanel[i].channelName);
        }
    } else {
        regex = new RegExp(channelName, 'i');
        for (j = 0; j < arrayChanel.length; j = j + 1) {
            if (arrayChanel[j].channelName.match(regex)) {
                listChannel.push(arrayChanel[j].channelName);
            }
        }
    }
    return {listChannel: listChannel, channelName: channelName};
}
function getNicknameCurrentChannel (channelName) {
    "user strict";
    var i;
    if (channelExist(channelName) === true) {
        for (i = 0; i < arrayChanel.length; i = i + 1) {
            if (arrayChanel[i].channelName === channelName) {
                return {error: null, data: arrayChanel[i].users};
                break;
            }
        }
    } else {
        return {error: "channel not found !!", data: null};
    }
}
function leaveChannel (nickname, channelName) {
    "use strict";
    var i, j;
    if (channelExist(channelName) === true) {
        for (i = 0; i < arrayChanel.length; i = i + 1) {
            if (arrayChanel[i].channelName === channelName) {
                for (j = 0; j < arrayChanel[i].users.length; j = j + 1) {
                    if (arrayChanel[i].users[j] === nickname) {
                        arrayChanel[i].users.splice(j, 1);
                        return {error: null, data: {nickname: nickname, channel: channelName}};
                        break;
                    }
                }
            }
        }
    } else {
        return {error: "channel not found !!", data: null};
    }
}
function addChannel (nickname, channelName, fromChannel) {
    "use strict"
    if (userExist(nickname) === true) {
        if (channelExist(fromChannel) === true) {
            if (channelExist(channelName) === false) {
                arrayChanel.push({channelName: channelName, users: [nickname]});
                return {error: null, data: {channelName: channelName, nickname: nickname, fromChannel: fromChannel}};
            } else {
                return {error: "channel already exist !!", data: null};
            }
        } else {
            return {error: "you send from a channel not found !!", data: null};
        }
    } else {
        return {error: "nickname not found !!", data: null};
    }
}
function leaveIRC (nickname, channelName) {
    "use strict";
    var i, j, k;
    if (userExist(nickname) === true) {
        if (channelExist(channelName) === true) {
            for (i = 0; i < arrayChanel.length; i = i + 1) {
                for (j = 0; j < arrayChanel[i].users.length; j = j + 1) {
                    if (arrayChanel[i].users[j] === nickname) {
                        arrayChanel[i].users.splice(j, 1);
                    }
                }
            }
            for (k = 0; k < arrayUser.length; k = k + 1) {
                if (arrayUser[k].nickname === nickname) {
                    arrayUser.splice(k, 1);
                }
            }
            return {error: null, data: {nickname: nickname, channelName: channelName}};
        } else {
            return {error: "channel not found", data: null};
        }
    } else {
        return {error: "nickname not found", data: null};
    }
}
io.on('connection', function (socket) {
    "use strict";
    visitorCount = visitorCount + 1;
    console.log('someone come !! ' + visitorCount + ' visitor !!');
    for (c = 0; c < arrayChanel.length; c = c + 1) {
        channels.push(arrayChanel[c].channelName);
    }
    socket.emit("list channel", {error: null, data: channels});
    channels = [];
    setInterval(function () {
        for (c = 0; c < arrayChanel.length; c = c + 1) {
            channels.push(arrayChanel[c].channelName);
        }
        socket.emit("list channel", {error: null, data: channels});
        channels = [];
    }, 15000);
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
        if (channelMatch === false) {
            dataUserConnection.channel = "default";
            channelMatch = true;
        }
        if (userDuplicate === true) {
            reponse = {error: "nickname already taken", data: null};
        } else if (channelMatch === true) {
            arrayUser.push({nickname: dataUserConnection.nickname, userCheckLeave: userCheckLeave(dataUserConnection.nickname), channel: dataUserConnection.channel});
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
        reponse = "";
    });
    socket.on('all channel', function () {
        socket.emit('all channel', {error: null, data: arrayChanel});
    });
    socket.on('sendMessage', function (data) {
        if (userExist(data.nickname) === true) {
            if (channelExist(data.channel) === true) {
                io.sockets.emit('receiveMessage', {error: null, data: {nickname: data.nickname, to: data.to, channel: data.channel, message: data.message, userCheckLeave: userCheckLeave(data.nickname)}})
            } else if (data.channel === null) {
                io.sockets.emit('receiveMessage', {error: null, data: {nickname: data.nickname, to: data.to, channel: data.channel, message: data.message, userCheckLeave: userCheckLeave(data.nickname)}})
            } else{
                socket.emit('receiveMessage', {error: 'channel not found !!', data: null});
            }
        } else {
            socket.emit('receiveMessage', {error: 'nickname not found !!', data: null});
        }
    });
    socket.on('allShortcuts', function (data) {
        if (userExist(data.nickname) === true) {
            socket.emit('allShortcuts', {error: null, data: arrayShortcuts, trigger: data.trigger});
        } else {
            socket.emit('allShortcuts', {error: 'nickname not found !!', data: null});
        }
    });
    socket.on('goInChannel', function (data) {
        io.sockets.emit('goInChannel', nicknameAddInChannel(data.nickname, data.channel, data.fromChannel));
    });
    socket.on('change nickname', function (data) {
        reponse = "";
        if (userExist(data.newNickname) === false) {
            changeNickname(data.oldNickname, data.newNickname);
            reponse = {error: null, data: {allChannel: arrayChanel, oldNickname: data.oldNickname, newNickname: data.newNickname}};
        } else {
            reponse = {error: 'nickname already taken !!', data: null};
        }
        io.sockets.emit('change nickname', reponse);
    });
    socket.on('listChannel', function (data) {
        socket.emit('listChannel', {data: listChannel(data.channelName)});
    });
    socket.on('getUserCurrentChannel', function (data) {
        if (userExist(data.nickname) == true) {
            socket.emit('getUserCurrentChannel', getNicknameCurrentChannel(data.channel));
        } else {
            socket.emit('getUserCurrentChannel', {error: 'nickname not found !!', data: null});
        }
    });
    socket.on('getUserAllChannel', function (data) {
        if (userExist(data.nickname) == true) {
            socket.emit('getUserAllChannel', getNicknameAllChannel());
        } else {
            socket.emit('getUserAllChannel', {error: 'nickname not found !!', data: null});
        }
    });
    socket.on('leaveChannel', function (data) {
        if (userExist(data.nickname) == true) {
            io.sockets.emit('leaveChannel', leaveChannel(data.nickname, data.channel));
        } else {
            io.sockets.emit('leaveChannel', {error: 'nickname not found !!', data: null});
        }
    });
    socket.on('addChannel', function (data) {
        io.sockets.emit('addChannel', addChannel(data.nickname, data.channelName, data.fromChannel));
    });
    socket.on('leaveIRC', function (data) {
        io.sockets.emit('leaveIRC', leaveIRC(data.nickname, data.channelName));
    });
    socket.on('disconnect', function (){
        visitorCount = visitorCount - 1;
        console.log('someone quit !! ' + visitorCount + ' visitor !!');
    });
});
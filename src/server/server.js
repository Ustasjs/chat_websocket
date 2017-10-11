const WebSocketServer = new require('ws'),
    User = require('./server_modules/user'),
    webSocketServer = new WebSocketServer.Server({
        port: 3000,
        clientTracking: true
    });
const fs = require('fs');

var allUsers = null,
    history = null,
    onlineUsers = {};

fs.readFile('./server_modules/base/allUser.json', (err, data) => {
    if (err) {
        throw err;
    } 
    allUsers = JSON.parse(data);
})

fs.readFile('./server_modules/base/history.json', (err, data) => {
    if (err) {
        throw err;
    } 
    history = JSON.parse(data);
})

webSocketServer.on('connection', function(ws) {

    let id = null;

    // broadcast to everyone except current user. 

    function broadcast(server, currentSocket, data) {
        server.clients.forEach(function each(client) {
            if (client !== currentSocket && client.readyState === 1) {
                client.send(data);
            }
        });
    }

    function makeUsersArray() {
        let onlineUsersArray = [];

        for (let key in onlineUsers) {
            if (!onlineUsers.hasOwnProperty(key)) {
                continue;
            }

            onlineUsersArray.push(onlineUsers[key]);
        }

        return onlineUsersArray;
    }

    function updateOnlineUsers(usersArray) {
        let responseToAll = {};

        responseToAll.status = 'updateOnlineUsers';
        responseToAll.onlineUsers = usersArray;
        responseToAll = JSON.stringify(responseToAll);
        broadcast(webSocketServer, ws, responseToAll);
    }

    function updateMessagesHistory() {
        let responseToAll = {};
        
        responseToAll.status = 'updateMessagesHistory';
        responseToAll.history = history;
        responseToAll = JSON.stringify(responseToAll);
        broadcast(webSocketServer, ws, responseToAll);
    }
    
    ws.on('message', function(message) {
        let parsedData = JSON.parse(message),
            onlineUsersArray = [],
            response = {},
            alreadyOnline = false;

        if (parsedData.status === 'auth') {
            // Auth

            for (let key in onlineUsers) {
                if (!onlineUsers.hasOwnProperty(key)) {
                    continue;
                }
                if (parsedData.nick === onlineUsers[key].nick) {
                    alreadyOnline = true;
                }
            }

            id = Math.random();

            if (!allUsers.some((value) => {
                return value.nick === parsedData.nick;
            })) {
                let user = new User(parsedData.name, parsedData.nick);

                allUsers.push(user);
                response.status = 'authOk';
                response.user = user;
                onlineUsers[id] = user;

                fs.writeFile('./server_modules/base/allUser.json', JSON.stringify(allUsers), (err) => {
                    if (err) {
                        throw err;
                    }
                });

            } else if (alreadyOnline) {
                // check is user online already
                response.status = 'alreadyOnline';
            } else {
                allUsers.forEach((value) => {
                    if (value.nick === parsedData.nick) {
                        response.user = value;
                        response.status = 'userExist';
                        response.history = history;
                        onlineUsers[id] = value;
                    }
                })
            }

            onlineUsersArray = makeUsersArray();
    
            response.onlineUsers = onlineUsersArray;
    
            response = JSON.stringify(response);
    
            ws.send(response);

            // update online users info

            updateOnlineUsers(onlineUsersArray)
        }

        if (parsedData.status === 'newMessage') {
            // newMessage
            history.messages.push(parsedData.context);
            fs.writeFile('./server_modules/base/history.json', JSON.stringify(history), (err) => {
                if (err) {
                    throw err;
                }
            });

            let response = JSON.stringify(parsedData);

            broadcast(webSocketServer, ws, response);
        }

        if (parsedData.status === 'avatarUpload') {
            // set avatar to messagesHistory
            for (let i = 0; i < history.messages.length; i++) {
                if (history.messages[i].nick === parsedData.user.nick) {
                    history.messages[i].path = parsedData.user.avatar;
                }
            }

            fs.writeFile('./server_modules/base/history.json', JSON.stringify(history), (err) => {
                if (err) {
                    throw err;
                }
            });

            // set avatar to users base
            for (let i = 0; i < allUsers.length; i++) {
                if (allUsers[i].nick === parsedData.user.nick) {
                    allUsers[i].avatar = parsedData.user.avatar;
                }
            }

            fs.writeFile('./server_modules/base/allUser.json', JSON.stringify(allUsers), (err) => {
                if (err) {
                    throw err;
                }
            });

            // update messages history
            updateMessagesHistory();
        }

    });

    ws.on('close', function() {
        delete onlineUsers[id];

        let onlineUsersArray = makeUsersArray();

        updateOnlineUsers(onlineUsersArray);
    });

});
const controller = require('./controller');

new Promise((resolve, reject) => {
    let socket = new WebSocket('ws://127.0.0.1:3000/');

    socket.onopen = function() {
        resolve(socket);
    };

    socket.onerror = function() {
        reject(new Error('Ошибка при соединении'));
    };

}).then((socket) => {

    controller.init();

    return new Promise((resolve, reject) => {
        // auth

        socket.onmessage = function(event) {
            let parsedData = JSON.parse(event.data);
    
            if (parsedData.status === 'authOk' || parsedData.status === 'userExist') {
                console.log(parsedData);
                controller.handleNewUser(parsedData);
                // If user is logged in update messages history
                if (parsedData.status === 'userExist') {
                    controller.updateMessagesHistory(parsedData.history);
                }
                resolve(socket);
            }

            if (parsedData.status === 'alreadyOnline') {
                controller.handleAlert('alreadyOlnline');
            }
        };
    
        document.body.addEventListener('click', (e) => {
            // auth submit button
            if (e.target.classList.contains('button_auth')) {
                e.stopPropagation();
                let data = {
                    name: null,
                    nick: null,
                    status: null
                };
    
                data.name = document.getElementById('name').value,
                data.nick = document.getElementById('nick').value;
                data.status = 'auth';
                console.log(JSON.stringify(data));
                
                socket.send(JSON.stringify(data));
            }

            // file loader cansel button

            if (e.target.getAttribute('id') === 'fileCanselButton') {
                e.stopPropagation();
                controller.closeButtonHandler();
            }

            // user avatar 

            if (e.target.getAttribute('id') === 'userAvatar') {
                e.stopPropagation();
                controller.fileLoadHandler(socket);
            }
        })
    })

}).then((socket) => {

    let messageButton = document.getElementById('messageButton');

    // update user list and append new message

    socket.onmessage = function(event) {
        let parsedData = JSON.parse(event.data);
        
        if (parsedData.status === 'updateOnlineUsers') {
            controller.updateUsersList(parsedData);
        }

        if (parsedData.status === 'newMessage') {
            controller.appendMessage(parsedData.context);
        }

        if (parsedData.status === 'updateMessagesHistory') {
            console.log(parsedData);
            controller.updateMessagesHistory(parsedData.history);
        }
    }

    // main message button

    messageButton.addEventListener('click', (e) => {
        let message = {
            status: 'newMessage',
            context: null
        };

        message.context = controller.appendMessage();
        socket.send(JSON.stringify(message));
    })

}).catch((error) => {
    console.log(error);
})


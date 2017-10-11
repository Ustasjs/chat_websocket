const view = require('./view'),
    model = require('./model'),
    defaultUserAvatar = '../src/images/defaultAvatar.jpg';

class Controller {
    init() {
        view.authRender();
    }

    _makeUsersContext(data) {
        let context = {
            path: defaultUserAvatar,
            name: null,
            number: null,
            users: []
        };

        if (model.currentUser.avatar !== null) {
            context.path = model.currentUser.avatar;
        }

        context.name = model.currentUser.name;
        context.number = data.onlineUsers.length;

        for (let i = 0; i < data.onlineUsers.length; i++) {
            let obj = {
                name: data.onlineUsers[i].name
            };

            context.users.push(obj);
        }

        return context;

    }

    _makeMessageContext() {
        let context = {
                path: './src/images/defaultAvatar.jpg',
                name: null,
                nick: null,
                time: null,
                content: null
            },
            now = new Date(),
            hours = now.getHours() + '',
            minutes = now.getMinutes() + '';

        if (hours.length < 2) {
            hours = '0' + hours;
        }

        if (minutes.length < 2) {
            minutes = '0' + minutes;
        }

        if (model.currentUser.avatar !== null) {
            context.path = model.currentUser.avatar;
        }

        context.name = model.currentUser.name;
        context.nick = model.currentUser.nick;
        context.time = hours + ':' + minutes;
        context.content = document.getElementById('mainInput').value;

        return context;
    }

    fileLoadHandler(socket) {
        view.fileLoadRender();

        let dndZone = document.getElementById('inputFile');

        function localAvatarReload() {
            let nicks = document.querySelectorAll('[data-nick]');

            for (let i = 0; i < nicks.length; i++) {
                if (nicks[i].dataset.nick === model.currentUser.nick) {
                    let message = nicks[i].closest('.message'),
                        avatar = message.querySelector('.avatar');

                    avatar.setAttribute('src', model.currentUser.avatar);
                }
            }
        }

        dndZone.addEventListener('dragenter', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });

        dndZone.addEventListener('dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });

        dndZone.addEventListener('drop', (e) => {
            e.stopPropagation();
            e.preventDefault();

            let dt = e.dataTransfer,
                file = dt.files[0],
                reader = new FileReader(),
                img;

            if (file.size > 512000) {
                this.handleAlert('wrongSize');
            } else if (file.type !== 'image/jpeg') {
                this.handleAlert('wrongType');
            } else {
                let alertContainer = document.getElementById('alert');

                alertContainer.textContent = '';
                img = view.filePictureRender();

                reader.readAsDataURL(file);
                
                reader.onload = function(e) {
                    img.src = e.target.result;
                    model.currentUser.avatar = e.target.result;
                    
                    let fileLoadButton = document.getElementById('fileLoadButton');

                    function sendFile() {
                        let message = {
                            status: 'avatarUpload',
                            user: model.currentUser
                        };

                        view.avatarRender(model.currentUser.avatar);
                        localAvatarReload();

                        message = JSON.stringify(message);
                        socket.send(message);

                        fileLoadButton.removeEventListener('click', sendFile);

                        view.popUpRemove();
                    }

                    fileLoadButton.addEventListener('click', sendFile);
                }
            }
        })
    }

    closeButtonHandler() {
        view.popUpRemove();
    }

    handleAlert(typeOfError) {
        switch (typeOfError) {
            case 'alreadyOlnline':
                view.alertRender(model.alertAlreadyOlnline);
                break;
            case 'wrongSize':
                view.alertRender(model.alertWrongSize);
                break;
            case 'wrongType':
                view.alertRender(model.alertWrongType);
                break;
        }
    }

    handleNewUser(data) {
        model.getCurrentUser(data);

        let context = this._makeUsersContext(data);

        view.popUpRemove();
        view.usersRender(context);
    }

    updateUsersList(data) {
        let context = this._makeUsersContext(data);
        
        view.usersRender(context);
    }

    updateMessagesHistory(context) {
        view.messagesRender(context);
    }

    appendMessage(context) {
        if (context === undefined) {
            context = this._makeMessageContext();
        }
        
        view.singleMessageRender(context);

        return context;
    }
}

module.exports = new Controller();
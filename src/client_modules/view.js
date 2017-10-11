// templates 
const authTemplate = require('../../auth.hbs'),
    fileLoadTemplate = require('../../fileLoad.hbs'),
    messagesTemplate = require('../../messages.hbs'),
    singleMessageTemplate = require('../../singleMessage.hbs'),
    usersTemplate = require('../../users.hbs');

class View {
    authRender() {
        let html = authTemplate(),
            popUp = document.createElement('div');

        popUp.classList.add('popUp');
        popUp.setAttribute('id', 'popUp');
        popUp.innerHTML = html;
        document.body.appendChild(popUp);
    }

    popUpRemove() {
        document.querySelector('.popUp').remove();
    }

    alertRender(text) {
        let alert = document.getElementById('alert');

        alert.textContent = text;
    }

    avatarRender(url) {
        let avatar = document.getElementById('userAvatar');

        avatar.setAttribute('src', url);
    }

    fileLoadRender(context) {
        let html = fileLoadTemplate(context),
            popUp = document.createElement('div');

        popUp.classList.add('popUp');
        popUp.innerHTML = html;
        document.body.appendChild(popUp);
    }

    filePictureRender() {
        let container = document.getElementById('inputFile'),
            img = document.createElement('img');
        
        img.classList.add('input__img');
        container.innerHTML = '';
        container.appendChild(img);

        return img;
    }

    messagesRender(context) {
        let html = messagesTemplate(context),
            messagesList = document.getElementById('messagesList');

        messagesList.innerHTML = html;
    }

    singleMessageRender(context) {
        let html = singleMessageTemplate(context),
            messagesList = document.getElementById('messagesList'),
            message = document.createElement('li');

        message.classList.add('message');
        message.innerHTML = html;

        messagesList.appendChild(message);
    }

    usersRender(context) {
        let html = usersTemplate(context),
            users = document.getElementById('users');
        
        users.innerHTML = html;
    }
}

module.exports = new View();
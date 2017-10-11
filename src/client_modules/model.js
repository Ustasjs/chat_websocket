class Model {
    constructor() {
        this.currentUser = {};
        this.alertAlreadyOlnline = 'Пользователь с таким ником уже онлайн';
        this.alertWrongSize = 'Размер файла не должен превышать 512кб';
        this.alertWrongType = 'Файл должен быть в формате .jpg';
    }
    
    getCurrentUser(data) {
        this.currentUser.name = data.user.name;
        this.currentUser.nick = data.user.nick;
        this.currentUser.avatar = data.user.avatar;
    }
}

module.exports = new Model();
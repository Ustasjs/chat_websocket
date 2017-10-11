class User {
    constructor(name, nick, src = null) {
        this.name = name;
        this.nick = nick;
        this.avatar = src;
    }

    setName(name) {
        this.name = name;
    }

    setNick(nick) {
        this.nick = nick;
    }

    setAvatar(src) {
        this.avatar = src;
    }
}

module.exports = User;
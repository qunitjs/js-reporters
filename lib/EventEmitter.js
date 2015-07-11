export default class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    on(name, fun) {
        if (this.listeners[name] == undefined) {
            this.listeners[name] = [fun];
        }
        else {
            this.listeners[name].push(fun);
        }
    }

    emit(name, ...params) {
        if (this.listeners[name]) {
            for (var fun of this.listeners[name]) {
                fun(...params); //callback
            }
        }
    }
}
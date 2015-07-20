export default class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    on(name, callback) {
        if (this.listeners[name] === undefined) {
            this.listeners[name] = [callback];
        } else {
            this.listeners[name].push(callback);
        }
    }

    emit(name, ...params) {
        if (this.listeners[name]) {
            for (let callback of this.listeners[name]) {
                callback(...params);
            }
        }
    }
}

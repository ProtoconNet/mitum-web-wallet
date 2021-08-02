class Queue {
    constructor() {
        this.queue = [];
    }

    enque(item) {
        this.queue.push(item);
    }

    deque() {
        this.queue.shift();
    }

    isEmpty() {
        if(this.queue) {
            return false;
        }
        return true;
    }

    clear() {
        this.queue = [];
    }

    get length() {
        return this.queue.length;
    }

    get target() {
        if(this.isEmpty()) {
            return null
        }
        return this.queue[0];
    }
}

export default Queue;
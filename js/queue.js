/* MessageQueue is a variation of the Queue data structure that holds 
   previous messages rather then dequeing messages. */

class MessageQueue {
    constructor(arr) {
        this.messageQueueStack = [];
        if (typeof arr === 'undefined') {
            this.arr = [];
        } else {
            this.arr = [...arr];
        }
    }

    // Goes in FIFO order like a queue by reversing the array first.
    // will only go first n elements deep.
    forEach(mapFn, n = 4) { // default value is 4 because of the story.
        // .reverse() is destructive so first copy the array.
        let arrCopy = [...this.arr]; 
        arrCopy.reverse();
        arrCopy = arrCopy.slice(0, n);
        return arrCopy.map(mapFn);
    }

    emptyContents() {
        this.messageQueueStack.push([...this.arr]); // Make a shallow copy.
        this.arr = [];
    }

    pop() { // This isn't technically a queue method but it's needed.
        if (this.arr.length === 0 && this.messageQueueStack.length === 0) {
            console.error("Attempting to pop from an empty MessageQueue.");
            return;
        }

        if (this.arr.length === 1 && this.messageQueueStack.length > 0) {
            let result = this.arr.pop();
            this.arr = this.messageQueueStack.pop();
            return result;
        }

        if (this.arr.length === 0 && this.messageQueueStack.length > 0) {
            this.arr = this.messageQueueStack.pop();
            return;
        }

        return this.arr.pop();
    }

    enqueue(elem) { 
        this.arr.push(elem);
    }

    deque() {
        if (this.messageQueueStack.length === 0 && this.arr.length === 0) {
            return;
        }

        return this.arr.shift();
    }

    peek() {
        return this.arr[0];
    }

    toString() {
        return `All messages so far: ${this.messageQueueStack.toString()}`;
    }

    isEmpty() {
        return this.arr.length === 0;
    }

    length() {
        return this.arr.length;
    }
}
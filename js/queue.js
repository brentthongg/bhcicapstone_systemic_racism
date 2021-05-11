/* Queue implementation */

class Queue {
    constructor(arr, maxLength = -1) {
        if (typeof arr === 'undefined') {
            this.arr = [];
        } else {
            this.arr = [...arr];
        }
        this.maxLength = maxLength;
    }

    // Goes in FIFO order like a queue by reversing the array first.
    forEach(mapFn) { 
        // .reverse() is destructive so first copy the array.
        let arrCopy = [...this.arr]; 
        arrCopy.reverse();
        return arrCopy.map(mapFn);
    }

    emptyContents() {
        this.arr = [];
    }

    pop() { // This isn't technically a queue method but it's needed.
        if (this.arr.length === 0) {
            console.log("Attempting to pop queue when queue is empty.");
            return;
        }
        return this.arr.pop();
    }

    enqueue(elem) { 
        this.arr.push(elem);
        if (this.arr.length > this.maxLength) {
            this.deque();
        }
    }

    deque() {
        if (this.isEmpty()) {
            // do nothing
        }

        return this.arr.shift();
    }

    peek() {
        return this.arr[0];
    }

    toString() {
        return this.arr.toString();
    }

    isEmpty() {
        return this.arr.length === 0;
    }

    length() {
        return this.arr.length;
    }
}
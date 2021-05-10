class SceneIterator {
    constructor(story) {
        this.story = story;
        this.sceneStack = [];
        this.messageQueue = new Queue([], 4); // Empty queue, maxLength = 4
        this.curr = 1;
    }

    get(sceneId = -1) {
        if (sceneId === -1 && this.curr in this.story.scenes) {
            return this.story.scenes[this.curr];
        }
        else if (sceneId in story.scenes) {
            return this.story.scenes[this.curr];
        } else {
            console.error(`Scene of id ${sceneId} does not exist.`);
        }
    }

    nextScenes() {
        let sceneId = this.curr;
        if (sceneId in this.story.scenes) {
            return this.story.scenes[sceneId].choices.results;
        } else {
            console.error(`Scene of id ${sceneId} does not exist.`);
        }
    }

    next(sceneId = -1, choice=-1) {
        if (sceneId === -1) {
            sceneId = this.story.scenes[this.curr].choices.results[0];
        } 
        if (choice !== -1) {
            var textMessage = this.story.scenes[sceneId].textMessage;
            if (textMessage === "" || textMessage == null) {
                // this.messageQueue.emptyContents();
                textMessage = this.story.scenes[this.curr].choices.responses[choice];
                if (!textMessage) {
                    this.messageQueue.emptyContents();
                }
            }
            else {
                this.messageQueue.enqueue({
                    text: textMessage,
                    side: this.story.scenes[sceneId].side
                });
    
                // Some scenes have multiple messages from the other character
                // in a row, so we represent this as a list and enqueue all of them
                // into the message queue. 
                if (this.story.scenes[sceneId].charResponses && 
                    this.story.scenes[sceneId].charResponses.length > 0) {
                        this.story.scenes[sceneId].charResponses.forEach((e) => {
                            this.messageQueue.enqueue({
                                text: e,
                                side: 'right'
                            })
                        });
                    }
            }
        }

        this.sceneStack.push(this.curr);
        this.curr = sceneId;
        return this.get();
    }

    back() {
        if (this.sceneStack.length > 0) {
            let sceneId = this.sceneStack.pop();
            this.messageQueue.pop();
            if (sceneId in this.story.scenes) {
                this.curr = sceneId;
                return this.get();
            }
        } else {
            initCanvas(); // reset
        }
    }
}
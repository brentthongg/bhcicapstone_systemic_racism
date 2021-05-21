class SceneIterator {
    constructor(story) {
        this.story = story;
        this.sceneStack = [];
        this.messageQueue = new MessageQueue([]); // Empty queue, maxLength = 4
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

    nextChoiceTexts() {
        let sceneId = this.curr;
        if (sceneId in this.story.scenes) {
            return this.story.scenes[sceneId].choices.choiceTexts;
        } else {
            console.error(`Scene of id ${sceneId} does not exist.`);
        }
    }

    next(sceneId = -1, choice = -1) {
        if (this.nextScenes().length === 0) {
            // No more scenes left! End of the game.
            return;
        }

        if (sceneId === -1) {
            sceneId = this.story.scenes[this.curr].choices.results[0];
        }

        var currScene = this.story.scenes[this.curr];

        var textMessage = {
            text: "",
            side: ""
        };
        if (choice !== -1) {
            textMessage.text = currScene.choices.responses[choice];
            textMessage.side = "left";
        } else if (currScene.charResponses.length > 0) {
            textMessage.text = currScene.charResponses[0];
            textMessage.side = "right";
        } else if (currScene.choices.choiceTexts.length === 0 && 
                   currScene.choices.responses.length > 0) {
                    textMessage.text = currScene.choices.responses[0];
                    textMessage.side = "left";
        }

        if (textMessage.text.length === 0) { // no messages, reset
            this.messageQueue.emptyContents();
        } else {
            this.messageQueue.enqueue(textMessage);
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
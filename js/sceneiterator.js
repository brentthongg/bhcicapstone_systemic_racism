class SceneIterator {
    constructor(story) {
        this.story = story;
        this.sceneStack = [];
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

    next(sceneId = -1) {
        if (sceneId === -1) {
            sceneId = this.story.scenes[this.curr].choices.results[0];
        } 
        this.sceneStack.push(this.curr);
        this.curr = sceneId;
        return this.get();
    }

    back() {
        if (this.sceneStack.length > 0) {
            let sceneId = this.sceneStack.pop();
            if (sceneId in this.story.scenes) {
                this.curr = sceneId;
                return this.get();
            }
        } else {
            initCanvas(); // reset
        }
    }
}
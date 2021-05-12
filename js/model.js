/* 
 * All the models for each table in the database. Note that this code
 * isn't actually being used, but can be a useful reference to how things
 * are being represented within the database.
 */

class Choice {
    constructor(responses, results) {
        if (responses.length === 0 && results.length !== 1) {
            throw "Results length should be 1 if no responses.";
        }
        else if (responses.length !== 0 && responses.length !== results.length) {
            throw "Response lengths are not equal.";
        }

        // Responses is a list of which scene id it maps too
        this.responses = [...responses];
        this.results = [...results]; // Copy
    }

    toString() {
        return `Responses: ${this.responses}`;
    }
}

class Scene {
    constructor(id, choices, imageUrl, paragraph) {
        this.id = id;
        this.choices = [...choices]; 
        this.imageUrl = imageUrl;
        this.paragraph = paragraph;
    }

    toString() {
        return `Scene number: ${this.id}`;
    }
}

class Character {
    constructor(name, image) {
        this.name = name;
        this.charImageUrl = image;
    }

    toString() {
        return `Character: ${this.name}`;
    }
}

class Story {
    constructor(scenes) {
        this.scenes = scenes;
    }

    toString() {
        return `Scenes: ${this.scenes}`;
    }
}

class Session {
    constructor(data) {
        this.data = data;
    }

    toString() {
        return `Data: ${this.data}`
    }
}
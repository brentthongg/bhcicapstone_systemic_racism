// Initialize Cloud Firestore through Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDiI3lnDbIEqgc-4dhXziI0WFkLUYkjXSI",
    authDomain: "bhci-capstone-project-4.firebaseapp.com",
    projectId: "bhci-capstone-project-4",
    storageBucket: "bhci-capstone-project-4.appspot.com",
    messagingSenderId: "1010203821828",
    appId: "1:1010203821828:web:3e0b2be6ea3826bfd4b251",
    measurementId: "G-620FYSBZSV"
};

/* VARIABLES */
var stories = [];
var characterImages = {};
var resourceManager = new ResourceManager();
var charConverter = {
    toFirestore: function(character) {
        return {
            name: character.name,
            charImageUrl: character.charImageUrl
            };
    },

    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options);
        return new Character(data.name, data.charImageUrl);
    }
};

function initSession(db) {
    // Change to localStorage if we want sessions to persist past tab close. 
    if (sessionStorage.getItem('sessionId') === null) { 
        db.collection('sessions').add({
            // Purposefully left empty, data is populated later (on window 
            // close or finished session).
        })
        .then((docRef) => {
            sessionStorage.setItem('sessionId', docRef.id);
            console.log("Document created with ID: ", docRef.id);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
    } else {
        console.log(sessionStorage.getItem('sessionId'));
    }

    // Load the game through scripts.js:
    initCanvas();
} 

var db;
$(document).ready(function() {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    loadResources(db);
});

function loadResources(db) {
    var allResources = [];
    db.collection("characters").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.exists) {
                let character = doc.data();
                for (var emotion in character.emotionURL) {
                    if (!(character.emotionURL[emotion] == "")) {
                        allResources.push(character.emotionURL[emotion])
                        if (!(doc.id in characterImages)) {
                            characterImages[doc.id] = {}
                        }; 
                        characterImages[doc.id][emotion] = character.emotionURL[emotion]; 
                        console.log(character.emotionURL[emotion])
                        console.log(emotion);
                    } 
                };
                //characterImages[doc.id] = character.charImageUrl;
            } else {
                console.log("No data found for characters.");
            }
        });
    })
    .then(() => {
        db.collection("stories").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.exists) {
                    stories.push({
                        id: doc.id,
                        data: doc.data()
                    });
                    console.log(stories);
                    let scenes = doc.data().scenes;
                    for (var id in scenes) {
                        allResources.push(scenes[id].imageUrl)
                    }
                } else {
                    console.log("No data found for stories.");
                }
            });
        });
    })
    .then(() => {
        for (let i = 0; i < stories.length; i++) {
            extractStoryData(stories[i].data, stories[i]);
        }
        resources.load(allResources);
        resources.onReady(() => initSession(db));
    });
}

function extractStoryData(data) {
    var storyScenes = {};
    var characterCache = {}; // Don't want to call API if already loaded.
    for (var sceneId in data.scenes) {
        let sceneData = data.scenes[sceneId];
        
        var charArray = [];
        for (let i = 0; i < sceneData.characters.length; i++) {
            let character = sceneData.characters[i];
            if (character.id in characterCache) {
                charArray.push(characterCache[character.id]);
            } 
            
            else {
                character.get().then((doc) => {
                    var charImage = new Image();
                    charImage.src = doc.data().charImageUrl;
                    charArray.push(charImage);
                    characterCache[character.id] = charImage;
                });
            }
        }

        storyScenes[sceneId] = {
            characters: charArray,
            choices: {
                responses: [...sceneData.choices.responses],
                results: [...sceneData.choices.results]
            },
            imageUrl: sceneData.imageUrl,
        }

    }

}
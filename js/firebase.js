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
var user;

function init(db) {
    // Cache the ip address into local storage so that it persists longer and 
    // limits API calls. 
    if (localStorage.getItem('ipAddress') === null) {
        let apiKey = '3d38e0466224473a9620e707f2e9788a';
        $.getJSON('https://api.ipgeolocation.io/ipgeo?apiKey=' + apiKey, (data) => {
            localStorage.setItem('ipAddress', data.ip);
        })
        .then(() => {
            initSession(db);
        });
    } else {
        initSession(db);
    }
}

function initSession(db) {
    // Load the game through scripts.js. This sets up the session data and then
    // initializes the canvas. If session already exists, then it just 
    // starts the game.
    if (sessionStorage.getItem('sessionId') === null) { 
        db.collection('sessions').add({
            ipAddress: localStorage.getItem('ipAddress'),
            openedGame: Date.now()
        })
        .then((docRef) => {
            sessionStorage.setItem('sessionId', docRef.id);
            initCanvas();
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
    } else {
        initCanvas();
    }
    
}

// Initializes the connection to the firebase database.
var db;
$(document).ready(function() {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    loadResources(db);
});

// Loads all resources into the resource manager.
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
                    } 
                };
            } else {
                console.error("No data found for characters.");
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
                    let scenes = doc.data().scenes;
                    for (var id in scenes) {
                        allResources.push(scenes[id].imageUrl);
                    }
                } else {
                    console.error("No data found for stories.");
                }
            });
        });
    })
    .then(() => {
        for (let i = 0; i < stories.length; i++) {
            extractStoryData(stories[i].data, stories[i]);
        }
        resources.load(allResources);
        resources.onReady(() => { init(db) });
    });
}

function writeSession(sessionData, finished=true) {
    sessionData['ipAddress'] = localStorage.getItem('ipAddress');
    let sessionId = sessionStorage.getItem('sessionId');
    var sessionRef = db.collection("sessions").doc(sessionId);
    sessionRef.update(sessionData).then(() => {
        if (finished) { // reset
            initCanvas();
        }
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
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

var pushToFirebase = true;

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
    if (pushToFirebase) {
        pushResourcesToFirebase(db);
    }
    loadResources(db);
});

function loadResources(db) {
    var allResources = [];
    db.collection("characters").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.exists) {
                let character = doc.data();
                allResources.push(character.charImageUrl);
                characterImages[doc.id] = character.charImageUrl;
            } else {
                console.log("No data found for characters.");
            }
        });
    })
    .then(() => {
        db.collection("dummystories").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.exists) {
                    stories.push({
                        id: doc.id,
                        data: doc.data()
                    });
                    console.log(stories);
                    let scenes = doc.data().scenes;
                    for (var id in scenes) {
                        allResources.push(scenes[id].imageUrl);
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

function pushResourcesToFirebase(db) {
    var deondresStory = {
        scenes: {
            1: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: ["Ask Dad."],
                    results: [4],
                    responses: ["Hey Dad can I go to Billy's house tonight?"],
                    disableMessage: true
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "It’s finally the weekend and you’ve been excited to go to Billy’s house to hang out with some of your friends.",
                charResponses: []
            }, 
    
            2: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [3],
                    responses: ["Hey Dad can I go to Billy's house tonight?"]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "This is the first time you’ve been to his house, so your parents will have a lot of questions.",
                charResponses: []
            }, 
    
            3: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [4],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: []
            },
    
            4: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [5],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: ["How do you know Billy?"]
            },
    
            5: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [6],
                    responses: ["He's a friend from fourth period."]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: []
            },
    
            6: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: ["All day...", "Just a few hours..."],
                    results: [7, 7],
                    responses: ["All day! Can you pick me up at 10 tonight?", "Just a few hours. Can you pick me up at 6?"]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: []
            },
    
            7: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [8],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: ["Okay sure I'd be happy to. Where does Billy live?"]
            },
    
            8: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [9],
                    responses: ["In Heysworth, about 35 minutes outside of town."]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: []
            },
    
            9: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [10],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "Your dad looks concerned, and hesitates with what he should say next. After a few seconds of deep thought, he looks at you with a serious expression.",
                charResponses: []
            },
    
            10: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [11],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: ["Listen, Deondre. When I was your age, there were signs in these types of neighborhoods saying that black folks were not allowed in the area after dark."]
            },
    
            11: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [12],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: ["We avoided going to these areas at all costs, even when the sun was out. We knew they weren’t welcome and that they were still in a lot of danger."]
            },
    
            12: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: ["Okay dad.", "This was decades ago.", "Why? What?", "So can I go?"],
                    results: [13, 14, 15, 16],
                    responses: ["Okay hurry it up dad...", "Well that was when you were little, dad. It’s not dangerous anymore.", "Why did they do that? What does that mean? Are those signs still there?", "Okay... so can I still go?"]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: []
            },
    
            13: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [17],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: ["Don’t get smart with me. I know you’ve heard this before, but even if the signs are no longer there, the prejudice of people who put them up is still there."]
            },
    
            14: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [18],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: ["The signs may be gone, but the prejudice of the people who put them up is still there. Heyworth may not be as dangerous for Black people as it once was, but you still need to be very careful while you are there."]
            },
    
            15: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [19],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: ["The signs may be gone, but the prejudice of the people who put them up is still there. Heyworth may not be as dangerous for Black people as it once was, but you still need to be very careful while you are there."]
            },
    
            16: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [20],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: ["Listen to me Deondre. I know you’ve heard this before, but even if the signs are no longer there, the prejudice of people who put them up is still there."]
            },
    
            17: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [21],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: ["Heyworth may not be as dangerous for Black people as it once was, but you still need to be very careful while you are there. Some people may think you do not belong."]
            },
    
            18: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [21],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: ["There aren’t a lot of Black folks in Heyworth even today, and some people may think you do not belong there."]
            },
    
            19: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [21],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: ["There aren’t a lot of Black folks in Heyworth even today, and some people may think you do not belong there."]
            },
    
            20: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [21],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/clay-home-bg.jpg?alt=media&token=9ad68a13-3ac1-4adb-afa4-db979f5de09e",
                prompt: "",
                charResponses: ["Heyworth may not be as dangerous for Black people as it once was, but you still need to be very careful while you are there. Some people may think you do not belong."]
            },
    
            21: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [22],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "After a long drive, you finally arrive at Billy’s street. Across the house from Billy, an ‘All Lives Matter’ sign is firmly planted in their front yard. Thinking about the conversation you just had with your dad, you get a little bit nervous and wonder if you should even be at Billy’s house...",
                charResponses: []
            },
    
            22: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
    
                    {
                        charImg: db.doc("/characters/9JSZ1GFF9HJYNGQuvI2S"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [23],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "Should you be at this place that doesn’t even make you feel safe? But Billy is so excited to see you, and you wonder if the fear is all in your head. He greets you and your dad as you pull up to his driveway. Your dad looks at you and says, “Remember what I told you. Now go and have fun!”...",
                charResponses: []
            },
    
            23: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [24],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "You get out of the car and wave your dad goodbye.",
                charResponses: []
            },
    
            24: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: ["Ask about neighbors...", "Ask about signs..."],
                    results: [25, 26],
                    responses: ["Do you know them? Are you friends with that family across the street?", "Those All Lives Matter signs are concerning to say the least. Yeah, all lives are important, but black lives are the ones in danger right now."]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: ["What's up!"]
            },
    
            25: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [27],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: ["Yeah...we’re not super close, but we go to church together every Sunday. Why?"]
            },
    
            26: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [28],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: ["Um... cool. Yeah."]
            },
    
            27: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [29],
                    responses: ["So like... do you think all lives matter?"]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: []
            },
    
            28: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [32],
                    responses: ["Dude I’m being serious. It makes me scared to think that people in this neighborhood don’t get it."]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: []
            },
    
            29: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [30], 
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: ["I mean it makes sense. All lives are important."]
            },
    
            30: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [31],
                    responses: ["Yeah, all lives are important, but black lives are the ones in danger right now. Why do you think people are protesting all around the country?"]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: []
            },
    
            31: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [32],
                    responses: ["It’s like saying Save the Oceans. That doesn’t mean forget about the forests and the mountains and all the other natural places out there. It just means that oceans need more attention than those other places right now."]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: []
            },
    
            32: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [33],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: ["Well, let’s not get into that right now. We’ve got a game to play!"]
            },
    
            33: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [34],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "His quick change in the topic of conversation disheartens you. Does he actually care or is he just trying to get you to move on?",
                charResponses: []
            },
    
            34: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [35],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "Billy directs you to his back yard. A group of 5 other kids from your school greet you with fist bumps. On the ground, there are a bunch of water guns and water balloons already filled and ready to be played with.",
                charResponses: []
            },
    
            35: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [36],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: ["We’ve been planning this water gun fight all week dude!"]
            },
    
            36: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [37],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: ["We’ve been planning this water gun fight all week dude, so let's do this!"]
            },
    
            37: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [38],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: ["The entire neighborhood is fair game, no boundaries. Grab a gun, and try not to get wet! It’s every man for himself."]
            },
    
            38: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charScreenSide: "worried"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [39],
                    responses: ["Wait, Billy, I shouldn’t join you guys in this water gun fight. I’m afraid someone may mistake it for a real gun and I’ll get in trouble or worse."]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "Billy and all of his friends excitedly grab their guns, but you hesitate, knowing you are one of the few Black kids in town. You pause and start thinking to yourself, but without even realizing it, you’re speaking out loud.",
                charResponses: []
            },
    
            39: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charScreenSide: "worried"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [40],
                    responses: ["Plus, I didn’t know we’d be running around your neighborhood like this."]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "Billy and all of his friends excitedly grab their guns, but you hesitate, knowing you are one of the few Black kids in town. You pause and start thinking to yourself, but without even realizing it, you’re speaking out loud.",
                charResponses: []
            },
    
            40: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charScreenSide: "worried"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [41],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: []
            },
    
            41: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charScreenSide: "worried"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: ["I'm not doing this...", "I'm not doing this.", "Can we just stay back here?"],
                    results: [42, 43, 44],
                    responses: ["Yeah, I’m not doing this. It’s actually more dangerous for me than you realize.", "tually, never mind. I shouldn’t have said anything", "Maybe we can just have the fight in your backyard instead?"]
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "How do you respond?",
                charResponses: ["Seriously dude? Nothing’s gonna happen to you."]
            },
    
            42: {
                characters: [
                    {
                        charImg: db.doc("/characters/epQ8q7ge1L7M6GdftoY2"),
                        charScreenSide: "left",
                        charEmotion: "happy"
                    },
                    {
                        charImg: db.doc("/characters/AUVFdncz2vpuXCpw4uRa"),
                        charScreenSide: "right",
                        charEmotion: "happy"
                    }
                ],
                choices: {
                    choiceTexts: [],
                    results: [],
                    responses: []
                },
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/bhci-capstone-project-4.appspot.com/o/Outside%20Billy%20House.jpg?alt=media&token=5db90aee-6cb2-42c7-8a98-3764c4c0b725",
                prompt: "",
                charResponses: []
            }
        }
    }
    
    // db.collection("dummystories").doc("Deondre").set(deondresStory).then((docRef) => {
    //     console.log("Document written with ID: ", docRef.id);
    // });
}
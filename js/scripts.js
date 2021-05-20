/* This file holds the scripts for the game itself. It uses HTML5's canvas
   to draw elements onto the screen. */

/* VARIABLES */
// Game variables
var lastTime;
var totalTime = 0;
var startTime;
var sceneIterator;
var sessionData;
var currStoryId;
var charSprites; 

// Store the locations in case they change due to resize.
var backButtonLocation = {
    cx: -1,
    cy: -1,
    r: -1
}

var forwardButtonLocation = {
    cx: -1,
    cy: -1,
    r: -1
}

var sceneButtonLocations = {
    0: -1
}; 

// So that requestAnimationFrame works cross browser, see
// https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/ and
// https://github.com/jlongster/canvas-game-bootstrap/blob/a878158f39a91b19725f726675c752683c9e1c08/js/app.js#L22
var requestAnimFrame = (function() {
    return window.requestAnimationFrame     ||
        window.webkitRequestAnimationFrame  ||
        window.mozRequestAnimationFrame     ||
        window.oRequestAnimationFrame       ||
        window.msRequestAnimationFrame      ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


const gameStates = {
    currState: undefined,
    splashState: (context) => {
        gameStates.currState = 'splash';        
        splashScreenDraw(context);
    },
    inGameState: (context, storyId) => {
        gameStates.currState = 'inGame';
        document.getElementById('splash-overlay').remove();
        currStoryId = storyId;
        sessionData[currStoryId] = {};
        sessionData[currStoryId]['startTime'] = Date.now();
        gameMainLoop(context, storyId);
    }
}

function splashScreenRender(context) {
    // Draw the background:
    let bgUrl = 'images/mainbg.jpg';
    var bgImage = new Image();
    bgImage.addEventListener('load', () => {
        let w = document.documentElement.clientWidth;
        let h = w * (9 / 16); // Maintain full screen proportions
        context.drawImage(bgImage, 0, 0, w, h);
    }, false);
    bgImage.src = bgUrl;
}

function splashScreenDraw(context) {
    // Draw the background:
    let bgUrl = 'images/mainbg.jpg';
    var bgImage = new Image();
    bgImage.addEventListener('load', () => {
        let w = document.documentElement.clientWidth;
        let h = w * (9 / 16); // Maintain full screen proportions
        context.drawImage(bgImage, 0, 0, w, h);
    }, false);
    bgImage.src = bgUrl;
    
    // Draw the buttons and create their event listeners:
    var splashOverlayDiv = document.createElement('div');
    splashOverlayDiv.id = 'splash-overlay';
    for (let i = 0; i < stories.length; i++) {
        let charName = stories[i].id; // id of a story is the name
        let storyBtn = createStoryButton(charName, context);

        splashOverlayDiv.appendChild(storyBtn);
    }

    // Comment out these lines to get rid of the sessionID appearing at the beginning
    // of the game:
    let sessionText = document.createElement('p');
    let sessionSpanText = document.createElement('span');
    sessionSpanText.classList.add('highlight');
    sessionSpanText.innerText = `Session ID: ${sessionStorage.getItem('sessionId')}`;
    sessionText.appendChild(sessionSpanText);
    sessionText.id = "session-text";
    splashOverlayDiv.appendChild(sessionText);

    document.getElementById('wrapper').appendChild(splashOverlayDiv);
}

// TO DO: This restarts if someone goes back to the main page. Not sure if that
// is the desired functionality.
function setupCanvas(context) {
    
    // Other canvas set up for data collection...
}

/* How to change canvas size code from:
   https://stackoverflow.com/questions/4037212/html-canvas-full-screen */
function resizeCanvas(canvas) {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
}

function initCanvas() {
    // Create the canvas in javascript and append to the page.
    var canvas = document.createElement('canvas');
    canvas.id = 'main-canvas';
    resizeCanvas(canvas);
    document.getElementById('wrapper').appendChild(canvas);
    if (typeof sessionData == 'undefined') {
        sessionData = {};
    }

    // Add resizeCanvas function to resize so that it changes dynamically:
    window.onresize = () => resizeCanvas(canvas);
    // Get context to draw onto canvas
    if (canvas.getContext) {
        var context = canvas.getContext('2d');
        canvas.addEventListener('click', (event) => {
            let mousePosition = getMousePosition(canvas, event);
            handleMousePressed(mousePosition, context);
        }, false);
        setupCanvas(context);
        gameStates.splashState(context);
    } else {
        // TO DO: insert code for when context is not supported.
    }
}

function gameMainLoop(context, storyId) {
    var storyData;
    for (let i = 0; i < stories.length; i++) {
        if (stories[i].id == storyId) storyData = stories[i].data;
    }

    if (storyData === undefined) {
        console.error("Error occured while retrieving story. Please try again.");
        return;
    }

    sceneIterator = new SceneIterator(storyData);
    initCharacterSprites(sceneIterator.get());

    lastTime = Date.now();
    mainLoop(context);
}

function mainLoop(context) {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);
    if (gameStates.currState === 'inGame') {
        render(context);
    }
    else if (gameStates.currState === 'splash') {
        splashScreenRender(context);
    }

    lastTime = now;

    requestAnimFrame(() => mainLoop(context));
}

function update(dt) {
    totalTime += dt;
    for (i=0; i < charSprites.length; i++) {
        charSprites[i].update(); 
    }
    // Implement this function if we're doing sprites:
    // updateSpriteEmotion();
}


// The main draw function
function render(context) {
    renderScene(context);
    renderMessages(context);
}

$(document).ready(function() {
    // initCanvas();
    // mainLoop();
});

/* HELPER RENDER FUNCTIONS */
function renderScene(context) {
    let scene = sceneIterator.get();
    renderSceneBg(context, scene);
    renderSceneButtons(context, scene);
    /* if (typeof charSprite != "undefined") {
        let charImg = charSprite.spritesheet; 
        charImg.addEventListener('load', () => {
            charSprite.draw(context); 
        }, false);
    } */
}

// https://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element
function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function renderScenePromptBackground(context, scene, lines, y) {
    if (scene.prompt.length == 0) {
        return;
    }
    let textHeightMargin = 35; // height + margin
    let margin = 20;

    let textMetrics = context.measureText(lines[0]);
    let h = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    let boxHeight = ((h + textHeightMargin) * lines.length) - (2 * textHeightMargin) + (2 * margin);
    let boxWidth = document.documentElement.clientWidth * .8;
    let y0 = y - margin - (h / 2.0)
    
    roundRect(context, document.documentElement.clientWidth * .1, y0, boxWidth, 
              boxHeight, 0, 'rgba(0, 0, 0, 0.5)', 0);

}

function renderScenePrompt(context, scene) {
    let textHeightMargin = 35;
    context.font = '32px Avenir';
    let maxWidth = document.documentElement.clientWidth * (.4);
    let lines = getLines(context, scene.prompt, maxWidth);
    
    
    x = document.documentElement.clientWidth / 2;
    if (sceneIterator.messageQueue.isEmpty()) {
        y = document.documentElement.clientHeight * 0.1;
    }
    else {
        y = document.documentElement.clientHeight * 0.75;
    }
    // renderScenePromptBackground(context, scene, lines, y);

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.fillText(line, x, y);
        context.textAlign = 'left';
        y += textHeightMargin;
    }
    context.fillStyle = 'black';
    
}

function partitionMessage(message, context) {
    if (typeof message.text === 'undefined') {
        return;
    }
    let maxWidth = document.documentElement.clientWidth / 4.0;
    var words = message.text.split(" ");
    var allLines = [];
    var currentLine = words[0];
    context.font = '20px Quicksand';

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = context.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            allLines.push(currentLine);
            currentLine = word;
        }
    }
    allLines.push(currentLine);

    // height of the first line, but they should all be the same
    let textMetrics = context.measureText(currentLine[0]);
    let h = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    return {lines: allLines, height: h}
}

function getMessageBoxBounds(context, msgContent, y, side) {
    let textHeightMargin = 10;
    let margin = 25;
    if (side === 'left') {
        var x0 = (document.documentElement.clientWidth * 0.33) - margin;
    } else {
        var x0 = (document.documentElement.clientWidth * 0.66) - margin;
    }

    let y0 = y - margin - (msgContent.height / 2.0);
    context.font = '20px Quicksand';
    let maxLength = msgContent.lines.reduce((maxWidth, currMsg) => {
        // Grabs the largest length in the lines and uses that as the width.
        return Math.max(context.measureText(currMsg).width, maxWidth);
    }, 0)
    let w = maxLength + (margin * 2);
    let h = ((msgContent.height + textHeightMargin) * msgContent.lines.length) - (2 * textHeightMargin) + (2 * margin);

    if (side === 'right') {
        x0 -= w;
        x0 += 2 * margin;
    }

    return {x0: x0, y0: y0, width: w, height: h};
}

function renderMessageBackground(context, msgContent, y, i, side) {
    let bounds = getMessageBoxBounds(context, msgContent, y, side);
    let r = 15;
    let fill = (side === 'left') ? 'white' : 'black';
    let stroke = 0;
    
    let opacity = getMessageOpacity(i);
    
    roundRectMsg(context, bounds.x0, bounds.y0, bounds.width, bounds.height, 
              r, fill, stroke, side, opacity);
    
}

function renderSingularMessage(context, msgContent, y, i, side) {
    let lines = msgContent.lines;
    let height = msgContent.height;
    let margin = 10;

    // First draw the message background:
    renderMessageBackground(context, msgContent, y, i, side);

    // Then write the text:
    for (let j = 0; j < lines.length; j++) {
        let line = lines[j];
        if (side === "left") {
            var x = document.documentElement.clientWidth * 0.33;
            context.textAlign = 'left';
            context.fillStyle = 'black';
        } else {
            var x = document.documentElement.clientWidth * 0.66;
            context.textAlign = 'right';
            context.fillStyle = 'white';
        }
        context.font = '20px Quicksand';
        context.fillText(line, x, y);
        y += height + margin;
        context.textAlign = 'left';
    }
    y += margin;

}

function renderMessages(context) {
    if (sceneIterator.messageQueue.isEmpty()) { return; }
    var y = document.documentElement.clientHeight / 2.0; // halfway
    let messageBoxMargin = 25;
    let margin = 20;
    let textHeightMargin = 10;
    var iter = 0;
    let maxMessageQueueLength = Math.max(0, sceneIterator.messageQueue.arr.length - 4);
    
    for (var i = sceneIterator.messageQueue.arr.length - 1; i > maxMessageQueueLength; i--) {
        let message = sceneIterator.messageQueue.arr[i];
        let nextMessage = sceneIterator.messageQueue.arr[i - 1];
        let result = partitionMessage(message, context);
        let nextResult = partitionMessage(nextMessage, context);
        
        renderSingularMessage(context, result, y, iter, message.side);
        nextMessageLength = nextResult.lines.length;
        let h = ((result.height + textHeightMargin) * nextMessageLength) - (2 * textHeightMargin) + (2 * messageBoxMargin);
        y -= (h + (margin * 2));
        iter++;
    }

    let message = sceneIterator.messageQueue.arr[i];
    let result = partitionMessage(message, context);
    renderSingularMessage(context, result, y, iter, message.side)

}

function initCharacterSprites (scene) {
    charSprites = []
    for (let i = 0; i < scene.characters.length; i++) {
        var charLink = scene.characters[i].charImg.id; 
        var charEmotion = scene.characters[i].charEmotion; 
        var charImage = resourceManager.get(characterImages[charLink][charEmotion]);
        var screenSide = scene.characters[i].charScreenSide;
        let charWidth = charImage.width;
        let charHeight = charImage.height;
        //varShift represents the shift in the x coords on the screen depending on if char is on left or right of the screen
        // If no side is defined, the original value
        //8 is hardcoded
        let spriteHeight = charImage.height/8; 
        //5 refers to the numSpritesinRow
        let spriteWidth = charImage.width/5;
        let varShift = charWidth/2; 
        if (screenSide == 'left') {
            varShift = 1.8*spriteWidth; 
        }
        else if (screenSide == 'right') {
            varShift = -1.5 * (spriteWidth/2); 
        };  
        let x0 = document.documentElement.clientWidth / 2 - varShift; 
        //Change the magic number 10 later
        let y0 = document.documentElement.clientHeight - 100 - spriteHeight;
        //context.drawImage(charImage, x0, y0, charWidth, charHeight);
        //Change y0 later
        //The width is messed up!!
        charSprite = new spriteObject(charImage, x0, y0 , 100, 36);
        charSprites.push(charSprite); 
    }
}

// CITATION: https://mr-easy.github.io/2017-06-26-creating-spritesheet-animation-in-html5-canvas-using-javascript/
function spriteObject(spritesheet, x, y, timePerFrame, numberOfFrames) {
    this.spritesheet = spritesheet;             //the spritesheet image
    this.x = x;                                 //the x coordinate of the object
    this.y = y; 
    this.width = spritesheet.width; 
    this.height = spritesheet.height;                             
    //this.width = width;                         //width of spritesheet
    //this.height = height;                       //height of spritesheet
    this.timePerFrame = timePerFrame;           //time in(ms) given to each frame
    //this.numberOfFrames = (width/numberOfFramesPerRow) * (height)
    this.numberOfFrames = numberOfFrames || 1;  //number of frames(sprites) in the spritesheet, default 1
    this.numSpritesInRow = 5; 
    this.spriteHeight = this.height/8; 
    this.spriteWidth = this.width/this.numSpritesInRow; 

    //current frame index pointer
    this.frameIndex = 0;

    //time the frame index was last updated
    this.lastUpdate = Date.now();

    //to update
    this.update = function() {
        if(Date.now() - this.lastUpdate >= this.timePerFrame) {
            this.frameIndex = (this.frameIndex + 1) % this.numberOfFrames; 
            this.lastUpdate = Date.now();
        }
    }

    this.draw = function(context) { 
        context.drawImage(this.spritesheet,
                         (this.frameIndex % this.numSpritesInRow) * (this.width/this.numSpritesInRow),
                          Math.floor(this.frameIndex/this.numSpritesInRow) * this.height/8,
                          this.width/this.numSpritesInRow,
                          this.height/8,
                          x,
                          y,
                          this.width/4, 
                          this.height/6);
    }
} 

function resetForwardButtonLocation() {
    forwardButtonLocation.cx = -1;
    forwardButtonLocation.cy = -1;
    forwardButtonLocation.r = -1;
}

function renderSceneButtons(context, scene) {
    if (scene.choices.choiceTexts.length === 0 || 
        scene.choices.responses.length === 0) {
        // Only would have a forward button, no choices:
        renderForwardButton(context);
    }
    else {
        resetForwardButtonLocation();
        renderChoiceButtons(context, scene);
    }

    // Always render a back button.
    renderBackButton(context)
}

function renderSingularChoiceButton(context, response, choiceNum) {
    context.font = '16px Quicksand';
    let margin = 15; 

    let x0 = sceneButtonLocations[choiceNum].x0;
    let y0 = sceneButtonLocations[choiceNum].y0;
    let width = sceneButtonLocations[choiceNum].width;
    let height = sceneButtonLocations[choiceNum].height;
    
    context.fillStyle = 'rgba(255, 255, 255, 0.85)';
    context.shadowBlur = 5;
    context.shadowColor = 'black';
    roundRect(context, x0, y0, width, height, 20, 'white', 0);
    context.shadowBlur = 0;
    context.fillStyle = 'black';  
    context.fillText(response, x0 + margin, 
                     y0 + (margin / 4.0) + (height / 2.0));
}

function updateSceneButtonLocations(scene, context) {
    context.font = "16px Quicksand";
    let margin = 15;
    let height = 50; // This might have to change to not be hard coded.

    /* First, get the length of the entire number of responses, and then 
       half of that width, which will be how much to subtract off of the
       middle of the screen to get to the starting point. */
    var totalWidth = 0;
    for (let i = 0; i < scene.choices.responses.length; i++) {
        if (scene.choices.choiceTexts) {
            response = scene.choices.choiceTexts[i];
        } else {
            response = scene.choices.responses[i];
        }

        totalWidth += context.measureText(response).width;
        totalWidth += (margin * 2);
        // Don't add the margin to the last response: 
        if (i + 1 !== scene.choices.responses.length) {
            totalWidth += margin;
        }
    }
    var baseX = (document.documentElement.clientWidth / 2.0) - (totalWidth / 2.0);

    for (let i = 0; i < scene.choices.responses.length; i++) {
        var response;
        if (scene.choices.choiceTexts) {
            response = scene.choices.choiceTexts[i];
        } else {
            response = scene.choices.responses[i];
        }

        context.font = "16px Quicksand";
        let width = context.measureText(response).width + (margin * 2);
        let x0 = baseX + margin;
        let y0 = document.documentElement.clientHeight * .85;

        sceneButtonLocations[i] = {
            x0: x0,
            y0: y0,
            width: width,
            height: height
        };

        baseX += width + margin;

    }

}

function renderChoiceButtons(context, scene) {
    updateSceneButtonLocations(scene, context);
    var responseCount = scene.choices.responses.length;
    for (let i = 0; i < responseCount; i++) {
        var response = scene.choices.responses[i];
        if (scene.choices.choiceTexts) {
            response = scene.choices.choiceTexts[i];
        }

        renderSingularChoiceButton(context, response, i, responseCount);
    }
}

function renderSceneCharacters(context, scene) {
    /*for (let i = 0; i < scene.characters.length; i++) {
        var charImage = resourceManager.get(characterImages[scene.characters[i].charImg.id]);
        var screenSide = scene.characters[i].charScreenSide;
        let charWidth = charImage.width;
        let charHeight = charImage.height;
        //varShift represents the shift in the x coords on the screen depending on if char is on left or right of the screen
        // If no side is defined, the original value
        let varShift = charWidth/2; 
        if (screenSide == 'left') {
            varShift = 1.5*charWidth; 
        }
        else if (screenSide == 'right') {
            varShift = -1 * (charWidth/2); 
        }; 
        let x0 = document.documentElement.clientWidth / 2 - varShift; 
        let y0 = document.documentElement.clientHeight - charHeight;
        //context.drawImage(charImage, x0, y0, charWidth, charHeight);
        charSprite = new spriteObject(charImage, x0, y0, 10, 80);*/
        for (let i =0; i < charSprites.length; i++) {
            charSprites[i].draw(context); 
        }; 
        renderScenePrompt(context, scene);
    }

function renderSceneBg(context, scene) {
    var bgImage = new Image();
    bgImage.addEventListener('load', () => {
        let w = document.documentElement.clientWidth;
        let canvasHeight = document.documentElement.clientHeight;
        let h = w * (9.0 / 16.0); // Maintain full screen proportions
        context.clearRect(0, 0, w, canvasHeight);
        context.drawImage(bgImage, 0, 0, w, h);
        renderSceneCharacters(context, scene);
    }, false);
    bgImage.src = scene.imageUrl;

}

function renderForwardButton(context) {
    let x = document.documentElement.clientWidth * (9.5 / 10.0);
    let y = document.documentElement.clientHeight * (9.0 / 10.0);
    let radius = 20;

    context.fillStyle = 'black';
    context.shadowBlur = 5;
    context.shadowColor = 'black';
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.shadowBlur = 0;

    drawLineArrow(context, x - radius + 5, y, x + radius - 5, y, 'white')

    forwardButtonLocation = {
        cx: x,
        cy: y,
        r: radius
    }
}

function renderBackButton(context) {
    let x = document.documentElement.clientWidth * (0.5 / 10.0);
    let y = document.documentElement.clientHeight * (9.0 / 10.0);
    let radius = 20;

    context.fillStyle = 'black';
    context.shadowBlur = 5;
    context.shadowColor = 'black';
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, true);
    context.closePath();
    context.fill();
    context.shadowBlur = 0;

    drawLineArrow(context, x + radius - 5, y, x - radius + 5, y, 'white');

    backButtonLocation = {
        cx: x,
        cy: y,
        r: radius
    }
}

/* mousePressed and other controller helper functions */
// https://stackoverflow.com/questions/24384368/simple-button-in-html5-canvas/24384882
function getMousePosition(canvas, event) {
    let canvasRect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - canvasRect.left,
        y: event.clientY - canvasRect.top
    };
}

function clickedStoryButton(mousePosition) {
    for (buttonId in sceneButtonLocations) {
        let x0 = sceneButtonLocations[buttonId].x0;
        let y0 = sceneButtonLocations[buttonId].y0;
        let width = sceneButtonLocations[buttonId].width;
        let height = sceneButtonLocations[buttonId].height;

        if ((mousePosition.x > x0 && mousePosition.x < (x0 + width)) && 
            (mousePosition.y > y0 && mousePosition.y < (y0 + height))) {
                return {
                    wasClicked: true,
                    button: buttonId
                };
            }
    }

    return {
        wasClicked: false,
        button: -1
    };
}

function clickedBackButton(mousePosition) {
    let distance = ((mousePosition.x - backButtonLocation.cx) ** 2 + 
                    (mousePosition.y - backButtonLocation.cy) ** 2) ** 0.5
    return distance < backButtonLocation.r;
}

function clickedForwardButton(mousePosition) {
    if (forwardButtonLocation == { cx: -1, cy: -1, r: -1 }) {
        return false;
    }
    let distance = ((mousePosition.x - forwardButtonLocation.cx) ** 2 + 
    (mousePosition.y - forwardButtonLocation.cy) ** 2) ** 0.5
    return distance < forwardButtonLocation.r;
}

function handleMousePressed(mousePosition, context) {
    if (gameStates.currState == 'splash') { return }
    else if (gameStates.currState === 'inGame') {
        let sceneClickResult = clickedStoryButton(mousePosition);

        if (sceneClickResult.wasClicked) {
            sessionData[currStoryId][Date.now().toString()] = sceneIterator.nextChoiceTexts()[sceneClickResult.button];
            let results = sceneIterator.nextScenes();
            let nextScene = sceneIterator.next(results[sceneClickResult.button], sceneClickResult.button);
            initCharacterSprites(nextScene); 
        }

        else if (clickedBackButton(mousePosition)) {
            sessionData[currStoryId][Date.now().toString()] = "back";
            sceneIterator.back();
            return;
        }

        else if (clickedForwardButton(mousePosition)) {
            sessionData[currStoryId][Date.now().toString()] = "forward";
            let nextScene = sceneIterator.next();
            if (nextScene == null) { // end of the game
                sessionData[currStoryId]['endTime'] = Date.now();
                writeSession(sessionData); // Finishes session and restarts game
                return;
            }
            initCharacterSprites(nextScene); 
        }
    }
}

/* HELPER FUNCTIONS FOR SPLASH + STORY */

function createStoryButton(name, context) {
    // Create the new button element:
    newBtn = document.createElement('button');
    newBtn.id = `${name}-story-btn`;
    newBtn.classList.add('story-btn');
    newBtn.innerText = `Play as ${name}.`;

    // Add event listener to get out of splash screen when clicked:
    newBtn.onclick = () => {
        gameStates.inGameState(context, name);
    }

    return newBtn;
}

function getMessageOpacity(i) {   
    let maxMessageCount = 4;  
    let maxOpacity = 1;
    return maxOpacity - maxOpacity * (i / maxMessageCount);
}

// CITATION:
// https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-using-html-canvas
function roundRect(ctx, x, y, width, height, radius, fill, stroke, opacity=1.0) {
    if (typeof stroke === 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.fillStyle = 'black';
    }
    if (stroke) {
      ctx.stroke();
    }
  
}

function roundRectMsg(ctx, x, y, width, height, radius, fill, stroke, side, opacity=1.0) {
    if (typeof stroke === 'undefined') {
        stroke = true;
    }
    
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    
    var blRadius = radius;
    var brRadius = radius;
    if (typeof radius === 'number') {
        if (side === 'left') { blRadius = 0; } 
        else { brRadius = 0; }
        radius = {tl: radius, tr: radius, br: brRadius, bl: blRadius};
    } else {
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: bl};
        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }

    ctx.beginPath();
    ctx.globalAlpha = opacity;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(0, 0, 0, ${opacity})`;
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'black';
    ctx.globalAlpha = 1.0;
    
}

/* CITATION: https://www.programmersought.com/article/16051099203/ */
function drawLineArrow(context, fromX, fromY, toX, toY, color) {
    var headlen = 10; // Customize the length of the arrow line
    var theta = 45; // Customize the angle between the arrow line and the line, personally feel that 45 ° is just right
    var arrowX, arrowY;//Arrow line end point coordinates
    // Calculate the angle of each angle and the corresponding arrow end point
    var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI;
    var angle1 = (angle + theta) * Math.PI / 180;
    var angle2 = (angle - theta) * Math.PI / 180;
    var topX = headlen * Math.cos(angle1);
    var topY = headlen * Math.sin(angle1);
    var botX = headlen * Math.cos(angle2);
    var botY = headlen * Math.sin(angle2);
    context.beginPath();
    context.lineWidth = 3;
    // draw a straight line
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);

    arrowX = toX + topX;
    arrowY = toY + topY;
    //Draw the upper arrow line
    context.moveTo(arrowX, arrowY);
    context.lineTo(toX, toY);

    arrowX = toX + botX;
    arrowY = toY + botY;
    //Draw the arrow line below
    context.lineTo(arrowX, arrowY);
    
    context.strokeStyle = color;
    context.stroke();
}

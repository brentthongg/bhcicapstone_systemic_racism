/* This file holds the scripts for the game itself. It uses HTML5's canvas
   to draw elements onto the screen. */

/* VARIABLES */
// Game variables
var lastTime;
var totalTime = 0;
var startTime;
var sceneIterator;

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

    document.getElementById('wrapper').appendChild(splashOverlayDiv);
}

// TO DO: This restarts if someone goes back to the main page. Not sure if that
// is the desired functionality.
function setupCanvas(context) {
    var startTime = Date.now();
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
    canvas.addEventListener('click', (event) => {
        let mousePosition = getMousePosition(canvas, event);
        handleMousePressed(mousePosition);
    }, false);
    document.getElementById('wrapper').appendChild(canvas);

    // Add resizeCanvas function to resize so that it changes dynamically:
    window.onresize = () => resizeCanvas(canvas);
    // Get context to draw onto canvas
    if (canvas.getContext) {
        var context = canvas.getContext('2d');
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
        console.log("Error occured while retrieving story. Please try again.");
        return;
    }

    sceneIterator = new SceneIterator(storyData);

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
    else {
        splashScreenRender(context);
    }

    lastTime = now;

    requestAnimFrame(() => mainLoop(context));
}

function update(dt) {
    totalTime += dt;
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

function renderScenePrompt(context, scene) {
    context.font = '32px Quicksand';
    let lines = getLines(context, scene.prompt, document.documentElement.clientWidth - 600);
    
    x = 300;
    y = 100;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        context.fillStyle = 'black';
        context.fillText(line, x, y);
        y += 35;
    }
    
}

function paritionMessage(message, ctx) {
    if (typeof message.text === 'undefined') {
        console.log(message);
        return;
    }
    let maxWidth = document.documentElement.clientWidth / 4.0;
    var words = message.text.split(" ");
    var allLines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            allLines.push(currentLine);
            currentLine = word;
        }
    }
    allLines.push(currentLine);

    // height of the first line, but they should all be the same
    let textMetrics = ctx.measureText(currentLine[0]);
    let h = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    return {lines: allLines, height: h}
}

function getMessageBoxBounds(context, msgContent, y, side) {
    let margin = 25;
    if (side === 'left') {
        var x0 = (document.documentElement.clientWidth * 0.25) - margin;
    } else {
        var x0 = (document.documentElement.clientWidth * 0.6) - margin;
    }

    let y0 = y - margin - (msgContent.height / 2.0);
    
    let maxLength = msgContent.lines.reduce((maxWidth, currMsg) => {
        // Grabs the largest length in the lines and uses that as the x1.
        return Math.max(context.measureText(currMsg).width, maxWidth);
    }, 0)
    let w = maxLength + (margin * 2);
    let h = (msgContent.height + margin) * msgContent.lines.length;

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
    context.font = '20px Quicksand';

    // First draw the message background:
    renderMessageBackground(context, msgContent, y, i, side);

    // Then write the text:
    for (let j = 0; j < lines.length; j++) {
        let line = lines[j];
        if (side === "left") {
            var x = document.documentElement.clientWidth * 0.25;
            context.fillStyle = 'black';
        } else {
            var x = document.documentElement.clientWidth * 0.6;
            context.fillStyle = 'white';
        }
        context.fillText(line, x, y);
        y += height + margin;
    }
    y += 10;

}

function renderMessages(context) {
    if (sceneIterator.messageQueue.isEmpty()) { return; }
    var y = document.documentElement.clientHeight / 2.0; // halfway
    let margin = 20;
    var iter = 0;

    sceneIterator.messageQueue.forEach((message) => { // This is done FIFO.
        let result = paritionMessage(message, context);
        
        renderSingularMessage(context, result, y, iter, message.side);
        y -= result.height + margin;
        iter++;
        
    });

}

function renderSceneButtons(context, scene) {
    if (scene.choices.responses.length === 0) {
        // Only would have a forward button, no choices:
        renderForwardButton(context);
    }
    else {
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
    roundRect(context, x0, y0, width, height, 5, 'white', 0);
    context.shadowBlur = 0;
    context.fillStyle = 'black';  
    context.fillText(response, x0 + margin, 
                     y0 + (margin / 4.0) + (height / 2.0));
}

function updateSceneButtonLocations(scene, context) {
    context.font = "16px Quicksand";
    let margin = 15;
    let height = 50;

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
        let y0 = document.documentElement.clientHeight * .8;

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
    for (let i = 0; i < scene.characters.length; i++) {
        var charImage = resourceManager.get(characterImages[scene.characters[i].charImg.id]);
        let charWidth = charImage.width / 2.0;
        let charHeight = charImage.height / 2.0;
        let x0 = document.documentElement.clientWidth / 2 - charWidth / 2;
        let y0 = document.documentElement.clientHeight / 3;
        context.drawImage(charImage, x0, y0, charWidth, charHeight);
        renderScenePrompt(context, scene);
    }
}

function renderSceneBg(context, scene) {
    var bgImage = new Image();
    bgImage.addEventListener('load', () => {
        let w = document.documentElement.clientWidth;
        let h = w * (9.0 / 16.0); // Maintain full screen proportions
        context.clearRect(0, 0, w, h);
        context.drawImage(bgImage, 0, 0, w, h);
        renderSceneCharacters(context, scene);
    }, false);
    bgImage.src = scene.imageUrl;

}

function renderForwardButton(context) {
    let x = document.documentElement.clientWidth * (9.5 / 10.0);
    let y = document.documentElement.clientHeight * (9.0 / 10.0);
    let radius = 20;

    context.fillStyle = 'white';
    context.shadowBlur = 5;
    context.shadowColor = 'black';
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.shadowBlur = 0;
    context.stroke();

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

    context.fillStyle = 'white';
    context.shadowBlur = 5;
    context.shadowColor = 'black';
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, true);
    context.closePath();
    context.fill();
    context.shadowBlur = 0;

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
    let distance = ((mousePosition.x - forwardButtonLocation.cx) ** 2 + 
    (mousePosition.y - forwardButtonLocation.cy) ** 2) ** 0.5
    return distance < forwardButtonLocation.r;
}

function handleMousePressed(mousePosition) {
    if (gameStates.currState == 'splash') { return }
    else if (gameStates.currState === 'inGame') {
        let sceneClickResult = clickedStoryButton(mousePosition);

        if (sceneClickResult.wasClicked) {
            let results = sceneIterator.nextScenes();
            sceneIterator.next(results[sceneClickResult.button], sceneClickResult.button);
        }

        else if (clickedBackButton(mousePosition)) {
            sceneIterator.back();
            return;
        }

        else if (clickedForwardButton(mousePosition)) {
            sceneIterator.next();
            return;
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
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
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
      ctx.fill();
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
    ctx.shadowColor = 'black';
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
    ctx.globalAlpha = 1.0;
    
}
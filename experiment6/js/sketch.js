// sketch.js - Haiku Generator with Natural Language Structure
// Author: Your Name
// Date:

let canvasContainer;
let currentHaiku = [];
let font;

// Enhanced line templates with thematic progression
const lineTemplates = {
    opening: [  // First line sets the scene
        ["adjective", "noun", "verb"],         // "dark eyes stare"
        ["verb", "article", "noun"],           // "break the glass"
        ["pronoun", "verb", "adverb"],         // "I drift deep"
        ["noun", "verb", "preposition"]        // "time falls through"
    ],
    development: [  // Second line develops the image
        ["pronoun", "verb", "preposition", "article", "noun"],     // "I drift through the night"
        ["adjective", "noun", "verb", "preposition", "noun"],      // "dark eyes stare through mirrors"
        ["verb", "article", "noun", "preposition", "noun"],        // "take the pain from inside"
        ["pronoun", "verb", "pronoun", "verb", "adverb"]          // "I watch it burn slowly"
    ],
    resolution: [  // Third line provides closure/twist
        ["verb", "pronoun", "adverb"],         // "watch me fall"
        ["adjective", "noun", "verb"],         // "sharp truth cuts"
        ["pronoun", "verb", "noun"],           // "I become void"
        ["noun", "verb", "adverb"]             // "mind drifts deep"
    ]
};

const customWordBanks = {
    article: [
        {word: "the", syllables: 1},
        {word: "a", syllables: 1}
    ],
    adjective: [
        {word: "deep", syllables: 1},
        {word: "dead", syllables: 1},
        {word: "alive", syllables: 2},
        {word: "nuclear", syllables: 3},
        {word: "infinite", syllables: 3},
        {word: "comfortable", syllables: 4},
        {word: "free", syllables: 1},
        {word: "tired", syllables: 1},
        {word: "radical", syllables: 3},
        {word: "hardwood", syllables: 2},
        {word: "blank", syllables: 1},
        {word: "numb", syllables: 1},
        {word: "idle", syllables: 2},
        {word: "eternal", syllables: 3},
        {word: "clear", syllables: 1},
        {word: "fine", syllables: 1},
        {word: "pure", syllables: 1},
        {word: "safe", syllables: 1},
        {word: "black", syllables: 1},
        {word: "loving", syllables: 2},
        {word: "infantile", syllables: 3},
        {word: "wide", syllables: 1},
        {word: "left", syllables: 1},
        {word: "classic", syllables: 2},
        {word: "strangled", syllables: 2},
        {word: "stitched", syllables: 1},
        {word: "open", syllables: 2},
        {word: "sharp", syllables: 1},
        {word: "good", syllables: 1},
        {word: "afraid", syllables: 2},
        {word: "human", syllables: 2},
        {word: "broken", syllables: 2},
        {word: "complex", syllables: 2},
        {word: "feeble", syllables: 2},
        {word: "violent", syllables: 3}
    ],
    noun: [
        {word: "dog", syllables: 1},
        {word: "pain", syllables: 1},
        {word: "sun", syllables: 1},
        {word: "blood", syllables: 1},
        {word: "head", syllables: 1},
        {word: "glass", syllables: 1},
        {word: "eyes", syllables: 1},
        {word: "mind", syllables: 1},
        {word: "virus", syllables: 2},
        {word: "window", syllables: 2},
        {word: "whistle", syllables: 2},
        {word: "energy", syllables: 3},
        {word: "vibrance", syllables: 2},
        {word: "patience", syllables: 2},
        {word: "star", syllables: 1},
        {word: "floor", syllables: 1},
        {word: "stain", syllables: 1},
        {word: "shrapnel", syllables: 2},
        {word: "midnight", syllables: 2},
        {word: "wall", syllables: 1},
        {word: "sky", syllables: 1},
        {word: "rain", syllables: 1},
        {word: "fog", syllables: 1},
        {word: "time", syllables: 1},
        {word: "chill", syllables: 1},
        {word: "frame", syllables: 1},
        {word: "vessel", syllables: 2},
        {word: "instinct", syllables: 2},
        {word: "life", syllables: 1},
        {word: "world", syllables: 1},
        {word: "hands", syllables: 1},
        {word: "thorns", syllables: 1},
        {word: "gut", syllables: 1},
        {word: "tears", syllables: 1},
        {word: "smile", syllables: 1},
        {word: "pilot", syllables: 2},
        {word: "defect", syllables: 2},
        {word: "absence", syllables: 2},
        {word: "killer", syllables: 2},
        {word: "motives", syllables: 2},
        {word: "boxes", syllables: 2},
        {word: "skin", syllables: 1},
        {word: "bed", syllables: 1},
        {word: "time", syllables: 1},
        {word: "soul", syllables: 1},
        {word: "clock", syllables: 1},
        {word: "cracks", syllables: 1},
        {word: "bombs", syllables: 1},
        {word: "dream", syllables: 1},
        {word: "pipe", syllables: 1},
        {word: "windows", syllables: 2},
        {word: "feeling", syllables: 2},
        {word: "demise", syllables: 2},
        {word: "point", syllables: 1},
        {word: "look", syllables: 1},
        {word: "rest", syllables: 1},
        {word: "error", syllables: 2},
        {word: "beauty", syllables: 2},
        {word: "blessing", syllables: 2},
        {word: "disease", syllables: 2},
        {word: "pain", syllables: 1},
        {word: "hurt", syllables: 1},
        {word: "form", syllables: 1},
        {word: "eyes", syllables: 1},
        {word: "palm", syllables: 1},
        {word: "cheek", syllables: 1},
        {word: "fire", syllables: 1},
        {word: "panes", syllables: 1},
        {word: "verve", syllables: 1},
        {word: "elbow", syllables: 2},
        {word: "spiral", syllables: 2},
        {word: "passion", syllables: 2},
        {word: "promise", syllables: 2},
        {word: "remedy", syllables: 3},
        {word: "oxygen", syllables: 3},
        {word: "paradise", syllables: 3},
        {word: "eternity", syllables: 4},
        {word: "smoke", syllables: 1},
        {word: "lungs", syllables: 1},
        {word: "feet", syllables: 1},
        {word: "cloud", syllables: 1},
        {word: "cage", syllables: 1},
        {word: "war", syllables: 1},
        {word: "death", syllables: 1},
        {word: "guilt", syllables: 1},
        {word: "thought", syllables: 1},
        {word: "mirror", syllables: 2},
        {word: "surface", syllables: 2},
        {word: "stereo", syllables: 3}
    ],
    verb: [
        {word: "blur", syllables: 1},
        {word: "fall", syllables: 1},
        {word: "paint", syllables: 1},
        {word: "trust", syllables: 1},
        {word: "save", syllables: 1},
        {word: "glued", syllables: 1},
        {word: "aim", syllables: 1},
        {word: "blast", syllables: 1},
        {word: "create", syllables: 2},
        {word: "repeat", syllables: 2},
        {word: "fixate", syllables: 2},
        {word: "worry", syllables: 2},
        {word: "imagine", syllables: 3},
        {word: "salivate", syllables: 3},
        {word: "see", syllables: 1},
        {word: "bleed", syllables: 1},
        {word: "look", syllables: 1},
        {word: "takes", syllables: 1},
        {word: "calculate", syllables: 3},
        {word: "walk", syllables: 1},
        {word: "breathe", syllables: 1},
        {word: "speak", syllables: 1},
        {word: "wash", syllables: 1},
        {word: "match", syllables: 1},
        {word: "burn", syllables: 1},
        {word: "stay", syllables: 1},
        {word: "rinse", syllables: 1},
        {word: "inflict", syllables: 2},
        {word: "run", syllables: 1},
        {word: "stare", syllables: 1},
        {word: "locked", syllables: 1},
        {word: "cut", syllables: 1},
        {word: "live", syllables: 1},
        {word: "grab", syllables: 1},
        {word: "board", syllables: 1},
        {word: "guard", syllables: 1},
        {word: "bring", syllables: 1},
        {word: "cleared", syllables: 1},
        {word: "ignored", syllables: 2},
        {word: "explored", syllables: 2},
        {word: "expired", syllables: 2},
        {word: "dissolved", syllables: 2},
        {word: "spin", syllables: 1},
        {word: "burst", syllables: 1},
        {word: "stop", syllables: 1},
        {word: "catch", syllables: 1},
        {word: "turn", syllables: 1},
        {word: "wait", syllables: 1},
        {word: "beg", syllables: 1},
        {word: "itch", syllables: 1},
        {word: "running", syllables: 2},
        {word: "waiting", syllables: 2},
        {word: "staring", syllables: 2},
        {word: "automate", syllables: 3},
        {word: "paralyze", syllables: 3},
        {word: "separate", syllables: 3},
        {word: "come", syllables: 1},
        {word: "think", syllables: 1},
        {word: "roll", syllables: 1},
        {word: "miss", syllables: 1},
        {word: "dilute", syllables: 2},
        {word: "berate", syllables: 2},
        {word: "repress", syllables: 2},
        {word: "take", syllables: 1},
        {word: "search", syllables: 1},
        {word: "comes", syllables: 1},
        {word: "goes", syllables: 1},
        {word: "pull", syllables: 1},
        {word: "break", syllables: 1},
        {word: "gaze", syllables: 1},
        {word: "reach", syllables: 1},
        {word: "touch", syllables: 1},
        {word: "splint", syllables: 1},
        {word: "evolve", syllables: 2},
        {word: "embrace", syllables: 2},
        {word: "repulse", syllables: 2},
        {word: "suppress", syllables: 2},
        {word: "explode", syllables: 2},
        {word: "reload", syllables: 2},
        {word: "fill", syllables: 1},
        {word: "sing", syllables: 1},
        {word: "build", syllables: 1},
        {word: "crash", syllables: 1},
        {word: "close", syllables: 1},
        {word: "stuck", syllables: 1},
        {word: "surge", syllables: 1}
    ],
    adverb: [
        {word: "deep", syllables: 1},
        {word: "yet", syllables: 1},
        {word: "inside", syllables: 2},
        {word: "deeper", syllables: 2},
        {word: "already", syllables: 3},
        {word: "too", syllables: 1},
        {word: "again", syllables: 2},
        {word: "better", syllables: 2},
        {word: "away", syllables: 2},
        {word: "now", syllables: 1},
        {word: "far", syllables: 1},
        {word: "here", syllables: 1},
        {word: "never", syllables: 2},
        {word: "faster", syllables: 2},
        {word: "down", syllables: 1},
        {word: "off", syllables: 1},
        {word: "more", syllables: 1},
        {word: "under", syllables: 2}
    ],
    preposition: [
        {word: "to", syllables: 1},
        {word: "in", syllables: 1},
        {word: "up", syllables: 1},
        {word: "by", syllables: 1},
        {word: "between", syllables: 2},
        {word: "from", syllables: 1},
        {word: "with", syllables: 1},
        {word: "off", syllables: 1},
        {word: "out", syllables: 1},
        {word: "at", syllables: 1},
        {word: "into", syllables: 2}
    ],
    pronoun: [
        {word: "you", syllables: 1},
        {word: "they", syllables: 1},
        {word: "their", syllables: 1},
        {word: "who", syllables: 1},
        {word: "my", syllables: 1},
        {word: "I", syllables: 1},
        {word: "your", syllables: 1},
        {word: "what", syllables: 1},
        {word: "this", syllables: 1}
    ]
};

function preload() {
    // Load a nice font for the haiku
    font = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Light.otf');
}

function setup() {
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");
    
    textFont(font);
    textAlign(CENTER, CENTER);
    
    // Generate initial haiku
    generateHaiku();
    
    $(window).resize(function() {
        resizeScreen();
    });
    resizeScreen();
}

function draw() {
    background(0, 0, 0);
    
    // Display the haiku
    displayHaiku();
}

function generateHaiku() {
    // Select a consistent theme and mood for the entire haiku
    const themes = ['transformation', 'dissolution', 'reflection', 'tension'];
    const moods = ['dark', 'introspective', 'intense', 'ethereal'];
    
    let theme = random(themes);
    let mood = random(moods);
    
    currentHaiku = [
        generateLine("opening", theme, mood, 5),
        generateLine("development", theme, mood, 7),
        generateLine("resolution", theme, mood, 5)
    ];
}

function generateLine(position, theme, mood, targetSyllables) {
    let template = random(lineTemplates[position]);
    let line = [];
    let attempts = 0;
    let maxAttempts = 50;
    let emotionalIntensity = position === "resolution" ? "high" : "medium";
    
    do {
        line = [];
        let syllableCount = 0;
        let lastWord = null;
        
        for (let partOfSpeech of template) {
            let validWords = customWordBanks[partOfSpeech].filter(word => 
                syllableCount + word.syllables <= targetSyllables &&
                isThematicallyAppropriate(word.word, theme) &&
                matchesEmotionalIntensity(word.word, emotionalIntensity)
            );
            
            if (lastWord) {
                validWords = filterForContext(validWords, lastWord, partOfSpeech, mood, theme);
            }
            
            if (validWords.length === 0) break;
            
            let word = selectWordForMoodAndTheme(validWords, mood, theme);
            line.push(word.word);
            syllableCount += word.syllables;
            lastWord = word;
        }
        
        attempts++;
    } while (countSyllables(line) !== targetSyllables && attempts < maxAttempts);
    
    return line.join(" ");
}

function filterForContext(words, lastWord, partOfSpeech, mood, theme) {
    // Avoid repetition
    words = words.filter(w => w.word !== lastWord.word);
    
    // Enhanced context-specific rules
    switch(partOfSpeech) {
        case "verb":
            if (lastWord.type === "verb") {
                words = words.filter(w => !w.word.endsWith("ing"));
            }
            if (lastWord.type === "noun") {
                // Prefer active verbs after nouns
                words = words.filter(w => !w.word.endsWith("ed"));
            }
            break;
            
        case "adjective":
            if (lastWord.type === "adjective") {
                return words.slice(0, Math.floor(words.length/2));
            }
            // Prefer emotionally consistent adjectives
            words = words.filter(w => matchesMood(w.word, mood));
            break;
            
        case "noun":
            if (lastWord.type === "adjective") {
                // Prefer concrete nouns after adjectives
                words = words.filter(w => !w.word.endsWith("ness"));
            }
            if (lastWord.type === "verb") {
                // Prefer thematically appropriate objects for the verb
                words = filterNounsByVerb(words, lastWord.word);
            }
            break;
            
        case "adverb":
            // Prefer adverbs that enhance the mood
            words = words.filter(w => matchesMood(w.word, mood));
            break;
    }
    
    return words;
}

function selectWordForMoodAndTheme(words, mood, theme) {
    // Prioritize words that match both mood and theme
    let bestMatches = words.filter(w => 
        matchesMood(w.word, mood) && 
        isThematicallyAppropriate(w.word, theme)
    );
    
    return random(bestMatches.length > 0 ? bestMatches : words);
}

function matchesMood(word, mood) {
    // This could be expanded with more sophisticated mood matching
    const moodWords = {
        dark: ['broken', 'pain', 'deep', 'black', 'blood', 'sharp'],
        introspective: ['mind', 'soul', 'drift', 'fade', 'mirror', 'reflect'],
        intense: ['burn', 'crash', 'explode', 'surge', 'violent', 'fire'],
        ethereal: ['fade', 'whisper', 'soft', 'quiet', 'gentle', 'slow']
    };
    
    return moodWords[mood].includes(word) || true; // Fallback to allow all words
}

function filterNounsByVerb(words, verb) {
    // Implement the logic to filter nouns based on the verb
    // This is a placeholder and should be replaced with the actual implementation
    return words;
}

function countSyllables(line) {
    return line.reduce((count, word) => {
        for (let type in customWordBanks) {
            let found = customWordBanks[type].find(w => w.word === word);
            if (found) return count + found.syllables;
        }
        return count;
    }, 0);
}

function displayHaiku() {
    textSize(24);
    fill(255);
    let startY = height/2 - 50;
    let lineSpacing = 40;
    
    for (let i = 0; i < currentHaiku.length; i++) {
        text(currentHaiku[i], width/2, startY + (i * lineSpacing));
    }
}

function mousePressed() {
    generateHaiku();
}

function resizeScreen() {
    resizeCanvas(canvasContainer.width(), canvasContainer.height());
}

function isThematicallyAppropriate(word, theme) {
    const thematicGroups = {
        transformation: ['change', 'evolve', 'break', 'form', 'become', 'emerge', 'blur'],
        dissolution: ['fade', 'melt', 'dissolve', 'drift', 'blur', 'smoke', 'fog'],
        reflection: ['mirror', 'glass', 'eyes', 'see', 'reflect', 'gaze', 'watch'],
        tension: ['break', 'snap', 'crack', 'strain', 'pull', 'tear', 'split']
    };
    
    return thematicGroups[theme].includes(word) || true; // Fallback
}

function matchesEmotionalIntensity(word, intensity) {
    const intensityLevels = {
        high: ['explode', 'shatter', 'surge', 'crash', 'burn', 'break'],
        medium: ['drift', 'flow', 'move', 'watch', 'feel', 'see'],
        low: ['fade', 'whisper', 'soft', 'quiet', 'gentle', 'slow']
    };
    
    return intensityLevels[intensity].includes(word) || true; // Fallback
}
// All story text lives here so it is easy to edit without touching game code.
// It follows the Ember Hollow Story Bible.

export const SPEAKERS = {
  wick: { name: 'Wick', color: '#3f7f86' },
  grandpa: { name: 'Grandpa Tallow', color: '#7a5a3c' },
  pip: { name: 'Pip', color: '#e8762a' },
  mossback: { name: 'Mossback', color: '#5a7a42' },
  narrator: { name: '', color: '#6a5a70' },
  thornwolf: { name: 'The Thornwolf', color: '#5a3a5a' },
  haru: { name: 'Haru', color: '#8a8070' },
  nell: { name: 'Nell', color: '#c9a030' },
};

// Cutscenes are lists of steps. `shot` changes the painted panel, `say` shows a
// line of dialogue, `title` shows a big title card, `wait` pauses (ms).
export const CUTSCENES = {
  C1: [
    { shot: 'hearth-night' },
    { say: 'narrator', text: 'In the valley of Hollowmere, there is a fire that has never gone out.' },
    { say: 'narrator', text: 'Every spring, we carry it home. Every winter, it keeps us warm.' },
    { shot: 'rooftop' },
    { say: 'grandpa', text: "You've polished that one four times, Wicklet." },
    { say: 'wick', text: "It has to be perfect. It's the festival lantern." },
    { say: 'grandpa', text: "A lantern's not for looking at. It's for being seen." },
    { say: 'grandpa', text: 'A light in the dark says, "Here I am. You\'re not alone."' },
    { say: 'wick', text: "...It's still going to be perfect." },
    { shot: 'rooftop-hush' },
    { say: 'grandpa', text: 'No. Not this year too.' },
    { say: 'wick', text: 'Grandpa? What is that?' },
    { say: 'grandpa', text: "The Hush. Get to the lantern tower. We light the big lantern, and it can't come in." },
    { say: 'grandpa', text: 'Run!' },
  ],
  C2: [
    { shot: 'tower-top' },
    { say: 'wick', text: 'Grandpa!' },
    { say: 'grandpa', text: 'Just... resting my eyes. Listen. Someone has to go to the Hearth.' },
    { say: 'wick', text: 'Then wake up and go!' },
    { say: 'grandpa', text: "Can't. Too old, too sleepy. Here. Take my lantern." },
    { say: 'grandpa', text: "You're the keeper now." },
    { shot: 'tower-sleep' },
    { wait: 1200 },
    { shot: 'pip-arrives' },
    { say: 'pip', text: 'Fwip?' },
    { say: 'wick', text: '...Hi.' },
    { say: 'pip', text: 'Fwip!' },
    { say: 'wick', text: "Okay. Okay. You and me, then. We're going to wake everyone up." },
    { title: 'Ember Hollow' },
  ],
  C3: [
    { shot: 'mossback' },
    { say: 'mossback', text: '...Hello... little... light.' },
    { say: 'wick', text: "AAH. You're a turtle!" },
    { say: 'mossback', text: 'Tortoise. ...We are... particular.' },
    { say: 'wick', text: 'Sorry. Sir. Do you know why the Hearth is going out?' },
    { say: 'mossback', text: 'Grandmother Ash... is very old. Old fires... grow tired. But not this tired.' },
    { say: 'mossback', text: 'Something... is holding her breath.' },
    { say: 'pip', text: 'Warm...?' },
    { say: 'mossback', text: 'Ah. That is... no ordinary ember. That is... a piece of her. She sent you, didn\'t she, little spark.' },
    { shot: 'mossback-gift' },
    { say: 'mossback', text: 'Take this. The forest has forgotten... how to see. Your light will... remind it.' },
    { title: "Pip's Glow", sub: 'Press X, C or the Y button to glow and reveal spirit paths.' },
  ],
  C4a: [
    { shot: 'woods-end' },
    { say: 'pip', text: 'Wick. Something... big. Ahead.' },
    { say: 'wick', text: 'I hear it too. Whatever it is, it sounds sad.' },
    { shot: 'thornwolf-reveal' },
    { say: 'thornwolf', text: 'The warm ones... TAKE. The fire takes... the forest...' },
    { say: 'wick', text: "Okay. Okay. It's just a very large, very angry wolf. Fine." },
    { say: 'pip', text: 'Lanterns! Shrine... lanterns!' },
    { say: 'wick', text: "Right. If we light the shrine, maybe he'll remember who he is. Pip, get ready to glow." },
  ],
  C4: [
    { shot: 'haru-fall' },
    { say: 'wick', text: "You weren't angry. You were scared." },
    { say: 'thornwolf', text: 'The warm ones... take. The fire takes... the forest...' },
    { say: 'wick', text: 'No. The fire IS the forest.' },
    { say: 'wick', text: '"Haru, who guards the cedars." That\'s what the shrine says. That\'s you, isn\'t it? Haru.' },
    { say: 'haru', text: '...Haru.' },
    { shot: 'haru-sleep' },
    { wait: 1200 },
    { say: 'pip', text: 'Wick. Wick... good.' },
    { say: 'mossback', text: 'The roots... run under the mountains. Go through... the caves.' },
    { title: 'End of Chapter 1', sub: 'Next: Chapter 2, Glimmer Caves' },
  ],
};

Object.assign(CUTSCENES, {
  C5: [
    { shot: 'mine-office' },
    { say: 'nell', text: 'WHO GOES THERE. State your business and your shoe size.' },
    { say: 'wick', text: "...Wick. Lantern-keeper. I'm going to the Hearth. Size three?" },
    { say: 'nell', text: "A lantern-keeper. You're like nine." },
    { say: 'wick', text: 'Eleven.' },
    { say: 'nell', text: "Well, I'm Nell, I'm TWELVE, and this is my mine. I don't need a kid with a candle getting lost in it." },
    { say: 'wick', text: "I wasn't offering." },
    { say: 'nell', text: 'Good!' },
    { say: 'wick', text: 'Good!' },
    { shot: 'mine-office-empty' },
    { say: 'pip', text: '...Same.' },
    { say: 'wick', text: 'We are NOT the same.' },
  ],
  C5b: [
    { shot: 'nell-saved' },
    { say: 'nell', text: '...Ow.' },
    { say: 'wick', text: 'Are you okay? Your cart jumped right off the rails.' },
    { say: 'nell', text: 'I MEANT to do that. It was a... shortcut.' },
    { say: 'pip', text: 'Crash.' },
    { say: 'nell', text: '...Fine. You saved me. Thanks, candle-kid.' },
    { say: 'nell', text: 'Here. My mum built this bellows. Stick it on your lantern and you\'ll go WHOOSH.' },
    { unlock: 'dash' },
    { title: 'Ember Dash', sub: 'Press Shift, V or the gamepad X button to dash through the air. Once per jump!' },
  ],
  C5c: [
    { shot: 'drowned-talk' },
    { say: 'nell', text: "The water's from the lower mine. That's where my crew was working when the Hush came." },
    { say: 'wick', text: 'Your crew?' },
    { say: 'nell', text: "My mum's the foreman. She's down there. Asleep. They all are." },
    { say: 'nell', text: 'I keep thinking if I just dig fast enough, by myself, I can fix it.' },
    { say: 'wick', text: '...Yeah. I know that one.' },
    { say: 'pip', text: 'Same.' },
    { say: 'wick', text: "Okay. Maybe we ARE the same. So let's go down there together." },
    { say: 'nell', text: "Together. Fine. But I'm in front." },
  ],
  C6: [
    { shot: 'sleepers-mine' },
    { say: 'nell', text: "Hi, Mum. Told you I'd find you. I just... thought I'd be able to wake you up." },
    { say: 'wick', text: "It won't wake them. But it'll keep them safe until I get to the Hearth." },
    { say: 'nell', text: "You'd... do that? Leave one of your lights here?" },
    { say: 'wick', text: "My grandpa says a lantern isn't for seeing. It's so others can see YOU. So she knows you're here." },
    { say: 'nell', text: "That's very sappy." },
    { say: 'nell', text: 'Come back, okay? Wake everyone up and then come back.' },
    { title: 'End of Chapter 2', sub: 'Thank you for playing! Chapter 3: Dusk Cliffs is on its way.' },
  ],
});

// One note is tied to each lantern post (checkpoint).
export const NOTES = [
  'Jump a little early rather than a little late. Ground forgives; holes don\'t.',
  'Gloomlings aren\'t mean, Wicklet. Just cold. A friendly bop on the head does wonders.',
  'If a path looks impossible, try looking at it with more light.',
  'Rest when you reach a light. Even keepers get tired.',
  'Mushrooms are the forest\'s way of saying "up you go."',
  'Count your embers, but don\'t forget to look at the view.',
  'Wind remembers where it\'s been. Ride it home.',
  'When it\'s darkest, sing. Doesn\'t matter how badly.',
];

// Memory Petals: three hidden in each level. Read in order they tell the story of Ash and Morrow.
export const PETALS = {
  'p-1': 'Long ago, the valley was cold and dark, and a fox made of fire lay down to sleep in a hollow tree.',
  'p-2': 'Where her breath touched the ground, flowers opened. The first villagers called her Grandmother Ash.',
  'p-3': 'Every spring, the villagers carried her flame home in lanterns. She liked that best of all.',
  '1-1a': 'A moth flew into the fire on purpose, and the fire, surprised, did not burn him.',
  '1-1b': 'His name was Morrow. He was grey and small and very, very serious.',
  '1-1c': 'Ash laughed at him. Nobody had ever laughed at Morrow before. He decided he liked it.',
  '1-2a': 'Ash taught Morrow the names of every star. Morrow taught Ash how to sit very still.',
  '1-2b': 'The forest spirits each had a name, and Ash remembered all of them.',
  '1-2c': 'A spirit that is remembered by name never truly falls asleep.',
  '1-3a': 'One winter, Morrow watched the candles in the village go out, one by one.',
  '1-3b': '"Will you go out too?" he asked. "Someday," said Ash. "Everything that burns does."',
  '1-3c': 'Morrow did not sleep that night, or the next.',
  '2-1a': 'The first lantern-keeper was a mole. Nobody remembers this except the moles.',
  '2-1b': 'Moles carried Ash\'s warmth through the roots, so the valley would never be cold underground.',
  '2-1c': 'The crystals grew where her sparks fell. That is why they glow.',
  '2-2a': 'Morrow visited the mines once. He did not like the dark, but he liked the crystals, because they kept their light.',
  '2-2b': '"A light you can keep," Morrow said, holding a crystal. "Now THAT is a good idea."',
  '2-2c': '"A kept light is a cold one, my friend," said Ash. Morrow did not listen.',
  '2-3a': 'The moles sang work songs to the crystals, and the crystals hummed back.',
  '2-3b': 'When the Hush came, the singing stopped first.',
  '2-3c': 'Water fills any space that warmth leaves behind.',
  '2-Fa': 'The foreman wrote in her logbook every night: "All safe. All warm."',
  '2-Fb': 'The last entry reads: "Something grey in the tunnels. Will check in the morning."',
  '2-Fc': 'In the margin, a small lantern is drawn in a child\'s hand. Under it: "For Mum."',
};

// Pip learns to talk as the story goes on. Lines are picked by chapter.
export const PIP_BARKS = {
  0: { ember: ['Fwip!', 'Fwip fwip!'], fall: ['Fweee--'], free: ['(happy spin)'], idle: ['(yawns a little spark)'], glow: ['Fwip!'] },
  1: { ember: ['Warm!', 'Warm!', 'More!'], fall: ['Wick?!'], free: ['Go home!', 'Warm now!'], idle: ['Sleepy...?'], glow: ['Look!', 'See?'], water: ['Nope.'] },
  2: { ember: ['More! More!', 'Shiny!', 'More!'], fall: ["We don't do holes."], free: ['Bye, friend!', 'Go home!'], idle: ["Are we lost? We're lost."], glow: ['Bright!', 'Look!'], water: ['NOPE.', 'No water. No.', 'NOPE. Nope nope.'] },
};

// Wick's one-time reactions.
export const WICK_BARKS = {
  firstFree: "Sorry! Sorry. Are you... okay? Oh, look at that. You're okay.",
  firstPit: "Don't look down. Don't look-- I looked.",
};

export const CHAPTER_NAMES = {
  0: 'Prologue: The Last Lantern',
  1: 'Chapter 1: Whispering Woods',
  2: 'Chapter 2: Glimmer Caves',
};

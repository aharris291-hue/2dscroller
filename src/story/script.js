// All story text lives here so it is easy to edit without touching game code.
// It follows the Ember Hollow Story Bible.

export const SPEAKERS = {
  wick: { name: 'Wick', color: '#3f7f86' },
  grandpa: { name: 'Grandpa Tallow', color: '#7a5a3c' },
  pip: { name: 'Pip', color: '#e8762a' },
  mossback: { name: 'Mossback', color: '#5a7a42' },
  narrator: { name: '', color: '#6a5a70' },
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
  END_DEMO: [
    { shot: 'woods-end' },
    { say: 'pip', text: 'Wick. Something... big. Ahead.' },
    { say: 'wick', text: "I hear it too. Whatever it is, it sounds sad." },
    { title: 'To be continued', sub: 'Chapter 1 finale: The Thornwolf' },
  ],
};

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
};

// Pip learns to talk as the story goes on. Lines are picked by chapter.
export const PIP_BARKS = {
  0: { ember: ['Fwip!', 'Fwip fwip!'], fall: ['Fweee--'], free: ['(happy spin)'], idle: ['(yawns a little spark)'], glow: ['Fwip!'] },
  1: { ember: ['Warm!', 'Warm!', 'More!'], fall: ['Wick?!'], free: ['Go home!', 'Warm now!'], idle: ['Sleepy...?'], glow: ['Look!', 'See?'] },
};

// Wick's one-time reactions.
export const WICK_BARKS = {
  firstFree: "Sorry! Sorry. Are you... okay? Oh, look at that. You're okay.",
  firstPit: "Don't look down. Don't look-- I looked.",
};

export const CHAPTER_NAMES = {
  0: 'Prologue: The Last Lantern',
  1: 'Chapter 1: Whispering Woods',
};

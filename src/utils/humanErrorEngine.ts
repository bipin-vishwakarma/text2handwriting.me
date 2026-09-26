import type { StrikeStyle } from '../types';

/**
 * Fast 32-bit FNV-1a string hash to convert any string seed to an integer.
 */
export function fastStringHash(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

/**
 * Fast 32-bit Mulberry32 PRNG.
 */
export function mulberry32(a: number) {
    return function() {
        let t = (a += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Deterministic pseudo-random number generator [0, 1) based on a string seed.
 */
export function getDeterministicRandom(seed: string): number {
    const intSeed = fastStringHash(seed);
    const rng = mulberry32(intSeed);
    return rng();
}

/**
 * Relative character width multipliers per handwriting font to ensure accurate word wrapping
 */
export const FONT_WIDTH_RATIOS: Record<string, number> = {
    // Authentic Rushed Doctor & Connecting Cursive Fonts
    'Meddon': 0.62,
    'Kristi': 0.44,
    'WindSong': 0.58,
    'Cedarville Cursive': 0.65,
    'League Script': 0.58,
    'Square Peg': 0.52,
    'La Belle Aurore': 0.54,
    'Waiting for the Sunrise': 0.55,
    'Marck Script': 0.58,
    'Zeyada': 0.54,
    'Dawning of a New Day': 0.56,

    // Authentic Rushed Student Homework & Ballpoint Scribbles
    'Nothing You Could Do': 0.58,
    'Mynerve': 0.54,
    'Just Me Again Down Here': 0.56,
    'Just Another Hand': 0.42,
    'The Girl Next Door': 0.54,
    'Sue Ellen Francisco': 0.40,
    'Loved by the King': 0.46,
    'Give You Glory': 0.56,
    'Bad Script': 0.56,

    // Hyphenated aliases for CSS/Store compatibility
    'meddon': 0.62,
    'kristi': 0.44,
    'windsong': 0.58,
    'cedarville-cursive': 0.65,
    'league-script': 0.58,
    'square-peg': 0.52,
    'la-belle-aurore': 0.54,
    'waiting-for-the-sunrise': 0.55,
    'marck-script': 0.58,
    'zeyada': 0.54,
    'dawning-of-a-new-day': 0.56,
    'nothing-you-could-do': 0.58,
    'mynerve': 0.54,
    'just-me-again-down-here': 0.56,
    'just-another-hand': 0.42,
    'the-girl-next-door': 0.54,
    'loved-by-the-king': 0.46,
    'sue-ellen-francisco': 0.40,
    'give-you-glory': 0.56,
    'bad-script': 0.56,
    // TextToHandwriting Classic Vault (Handwriting 1 to 22)
    'Handwriting 1': 0.62, 'handwriting-1': 0.62,
    'Handwriting 2': 0.58, 'handwriting-2': 0.58,
    'Handwriting 3': 0.60, 'handwriting-3': 0.60,
    'Handwriting 4': 0.60, 'handwriting-4': 0.60,
    'Handwriting 5': 0.56, 'handwriting-5': 0.56,
    'Handwriting 6': 0.52, 'handwriting-6': 0.52,
    'Handwriting 7': 0.58, 'handwriting-7': 0.58,
    'Handwriting 8': 0.54, 'handwriting-8': 0.54,
    'Handwriting 9': 0.50, 'handwriting-9': 0.50,
    'Handwriting 10': 0.48, 'handwriting-10': 0.48,
    'Handwriting 11': 0.52, 'handwriting-11': 0.52,
    'Handwriting 12': 0.54, 'handwriting-12': 0.54,
    'Handwriting 13': 0.50, 'handwriting-13': 0.50,
    'Handwriting 14': 0.54, 'handwriting-14': 0.54,
    'Handwriting 15': 0.55, 'handwriting-15': 0.55,
    'Handwriting 16': 0.54, 'handwriting-16': 0.54,
    'Handwriting 17': 0.52, 'handwriting-17': 0.52,
    'Handwriting 18': 0.55, 'handwriting-18': 0.55,
    'Handwriting 19': 0.52, 'handwriting-19': 0.52,
    'Handwriting 20': 0.55, 'handwriting-20': 0.55,
    'Handwriting 21': 0.54, 'handwriting-21': 0.54,
    'Handwriting 22': 0.54, 'handwriting-22': 0.54,

    // Extreme Messy / Raw Human Handwriting
    'Covered By Your Grace': 0.58,
    'covered-by-your-grace': 0.58,
    'Walter Turncoat': 0.62,
    'walter-turncoat': 0.62,
    'Rock Salt': 0.72,
    'rock-salt': 0.72,
    'Grape Nuts': 0.56,
    'grape-nuts': 0.56,
    'Swanky and Moo Moo': 0.60,
    'swanky-and-moo-moo': 0.60,
    'Sedgwick Ave': 0.58,
    'sedgwick-ave': 0.58,
    'Liu Jian Mao Cao': 0.65,
    'liu-jian-mao-cao': 0.65,
    'Caveat': 0.52,
    'caveat': 0.52,
    'Coming Soon': 0.54,
    'coming-soon': 0.54,
    'Schoolbell': 0.54,
    'schoolbell': 0.54,
    'Kalam': 0.56,
    'kalam': 0.56,
    'Patrick Hand': 0.58,
    'patrick-hand': 0.58,
    'Architects Daughter': 0.58,
    'architects-daughter': 0.58,
    'Indie Flower': 0.56,
    'indie-flower': 0.56,
    'Shadows Into Light': 0.54,
    'shadows-into-light': 0.54,
    'Caveat Brush': 0.62,
    'caveat-brush': 0.62,
    'Gotu': 0.60,
    'gotu': 0.60,
    'Reenie Beanie': 0.44,
    'reenie-beanie': 0.44,
    'Mr Dafoe': 0.58,
    'mr-dafoe': 0.58,
};

/**
 * Exact per-font scale multipliers calibrated to match real paper line heights
 * (Calibrated from texttohandwriting.com specifications where each font has distinct optical sizing)
 */
export const FONT_SCALE_MULTIPLIERS: Record<string, number> = {
    // texttohandwriting.com classic vault calibrations:
    'Handwriting 1': 1.45, 'handwriting-1': 1.45,
    'Handwriting 2': 1.18, 'handwriting-2': 1.18,
    'Handwriting 3': 1.22, 'handwriting-3': 1.22,
    'Handwriting 4': 1.10, 'handwriting-4': 1.10,
    'Handwriting 5': 1.10, 'handwriting-5': 1.10,
    'Handwriting 6': 0.98, 'handwriting-6': 0.98,
    'Handwriting 7': 1.14, 'handwriting-7': 1.14,
    'Handwriting 8': 1.02, 'handwriting-8': 1.02,
    'Handwriting 9': 0.92, 'handwriting-9': 0.92,
    'Handwriting 10': 0.88, 'handwriting-10': 0.88,
    'Handwriting 11': 0.92, 'handwriting-11': 0.92,
    'Handwriting 12': 0.94, 'handwriting-12': 0.94,
    'Handwriting 13': 0.82, 'handwriting-13': 0.82,
    'Handwriting 14': 0.98, 'handwriting-14': 0.98,
    'Handwriting 15': 1.05, 'handwriting-15': 1.05,
    'Handwriting 16': 1.00, 'handwriting-16': 1.00,
    'Handwriting 17': 1.00, 'handwriting-17': 1.00,
    'Handwriting 18': 1.02, 'handwriting-18': 1.02,
    'Handwriting 19': 0.98, 'handwriting-19': 0.98,
    'Handwriting 20': 1.08, 'handwriting-20': 1.08,
    'Handwriting 21': 1.00, 'handwriting-21': 1.00,
    'Handwriting 22': 1.00, 'handwriting-22': 1.00,
    'Kristi': 1.38, 'kristi': 1.38,
    'Reenie Beanie': 1.25, 'reenie-beanie': 1.25,
    'Rock Salt': 0.88, 'rock-salt': 0.88,
    'Caveat': 1.12, 'caveat': 1.12,
    'Kalam': 1.05, 'kalam': 1.05,
    'Patrick Hand': 1.04, 'patrick-hand': 1.04,
    'Architects Daughter': 1.02, 'architects-daughter': 1.02,
    'Indie Flower': 1.06, 'indie-flower': 1.06,
    'Shadows Into Light': 1.08, 'shadows-into-light': 1.08,
    'Caveat Brush': 1.04, 'caveat-brush': 1.04,
    'Gotu': 1.0, 'gotu': 1.0,
    'Walter Turncoat': 1.05, 'walter-turncoat': 1.05,
    'Covered By Your Grace': 1.08, 'covered-by-your-grace': 1.08,
};

export function getFontScaleMultiplier(font: string): number {
    if (!font) return 1.0;
    const clean = font.replace(/['"]/g, '').trim();
    return FONT_SCALE_MULTIPLIERS[clean] || FONT_SCALE_MULTIPLIERS[clean.toLowerCase()] || 1.0;
}

export function getEffectiveFontSize(font: string, baseFontSize: number): number {
    return Math.round(baseFontSize * getFontScaleMultiplier(font));
}

export const CURSIVE_CONNECTING_FONTS = new Set([
    'Cedarville Cursive', 'cedarville-cursive',
    'Meddon', 'meddon',
    'Kristi', 'kristi',
    'WindSong', 'windsong',
    'League Script', 'league-script',
    'Square Peg', 'square-peg',
    'La Belle Aurore', 'la-belle-aurore',
    'Waiting for the Sunrise', 'waiting-for-the-sunrise',
    'Marck Script', 'marck-script',
    'Zeyada', 'zeyada',
    'Dawning of a New Day', 'dawning-of-a-new-day',
    'Handwriting 4', 'handwriting-4',
    'Handwriting 20', 'handwriting-20',
    'Handwriting 2', 'handwriting-2',
    'Handwriting 5', 'handwriting-5',
    // Extreme connecting scripts
    'Mr Dafoe', 'mr-dafoe',
    'Caveat', 'caveat',
    'Kalam', 'kalam',
    'Caveat Brush', 'caveat-brush',
    'Grape Nuts', 'grape-nuts',
    'Sedgwick Ave', 'sedgwick-ave',
    'Liu Jian Mao Cao', 'liu-jian-mao-cao',
]);

export function isCursiveConnectingFont(font: string): boolean {
    if (!font) return true;
    const clean = font.replace(/['"]/g, '').trim();
    return CURSIVE_CONNECTING_FONTS.has(clean) || CURSIVE_CONNECTING_FONTS.has(clean.toLowerCase());
}

/**
 * Ensures font-family is strictly valid CSS with quotes around custom names containing spaces/numbers,
 * followed by organic cursive and sans-serif fallbacks.
 */
export function getFontFamilyCss(font: string): string {
    if (!font) return '"Cedarville Cursive", cursive, sans-serif';
    const cleanFont = font.replace(/['"]/g, '').trim();
    return `"${cleanFont}", cursive, sans-serif`;
}

export function getFontWidthRatio(fontFamily: string): number {
    const clean = fontFamily.replace(/['"]/g, '').trim();
    return FONT_WIDTH_RATIOS[clean] || FONT_WIDTH_RATIOS[fontFamily] || 0.56;
}

let measureCanvas: HTMLCanvasElement | null = null;
let measureCtx: CanvasRenderingContext2D | null = null;
const widthCache = new Map<string, number>();

export function clearWidthCache(): void {
    widthCache.clear();
}

if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
        clearWidthCache();
    }).catch(() => {});
}

/**
 * Pixel-accurate word width measurement via Canvas 2D with fallback to font ratios.
 */
export function measureWordWidth(word: string, font: string, fontSize: number): number {
    if (!word) return 0;
    const fontCss = getFontFamilyCss(font);
    const key = `${fontCss}:${fontSize}:${word}`;
    const cached = widthCache.get(key);
    if (cached !== undefined) return cached;

    if (typeof document !== 'undefined') {
        if (!measureCtx) {
            measureCanvas = document.createElement('canvas');
            measureCtx = measureCanvas.getContext('2d');
        }
        if (measureCtx) {
            measureCtx.font = `${fontSize}px ${fontCss}`;
            const width = measureCtx.measureText(word).width;
            if (width > 0) {
                if (widthCache.size > 3000) widthCache.clear();
                widthCache.set(key, width);
                return width;
            }
        }
    }

    const ratio = getFontWidthRatio(font);
    return word.length * (fontSize * ratio * 0.5);
}

export interface WordToken {
    text: string;
    isStruck: boolean;
    strikeStyle: StrikeStyle;
    caretCorrection?: string;
    isTypo?: boolean;
    isHighlighted?: boolean;
    highlightColor?: 'yellow' | 'green' | 'pink' | 'blue';
    isDoubleUnderline?: boolean;
    isBoxed?: boolean;
}

// Common realistic typos for English words
const TYPO_MAP: Record<string, string> = {
    the: 'teh',
    their: 'thier',
    receive: 'recieve',
    because: 'becuase',
    definitely: 'definately',
    separate: 'seperate',
    until: 'untill',
    which: 'whch',
    writing: 'writting',
    assignment: 'assignemnt',
    homework: 'homewrok',
    important: 'importent',
    problem: 'probelm',
    equation: 'equasion',
    function: 'funtion',
    solution: 'soluton',
    result: 'resutl',
    example: 'exampel',
    question: 'quesiton',
    answer: 'asnwerr',
    student: 'studnet',
    university: 'univeristy',
    college: 'colledge',
    school: 'shcool',
    different: 'diffrent',
    formula: 'formual',
    calculate: 'calcualte',
    method: 'mehtod',
    process: 'proccess',
    between: 'betewen',
    sentence: 'sentance',
    experience: 'experiance',
    development: 'developement',
    government: 'goverment',
    environment: 'enviorment',
    necessary: 'neccessary',
    accommodate: 'accomodate',
    beginning: 'begining',
    calendar: 'calender',
    discipline: 'descipline',
    embarrass: 'embarass',
    independent: 'independant',
    knowledge: 'knowlege',
    occurrence: 'occurance',
    perseverance: 'perseverence',
    possession: 'posession',
    privilege: 'privelege',
    rhythm: 'rythm',
    tomorrow: 'tommorrow',
    truly: 'truely',
    weird: 'wierd',
    experiment: 'experiement',
    laboratory: 'labratory',
    hypothesis: 'hypotesis',
    analysis: 'analisys',
    conclusion: 'conclution',
    reference: 'referance',
    structure: 'structur',
    pressure: 'presure',
    temperature: 'temprature',
    velocity: 'volocity',
    frequency: 'frequencey',
    circuit: 'circut',
    current: 'currunt',
    voltage: 'volatage',
    chemical: 'chemcial',
    reaction: 'reacton',
    element: 'elemant',
    compound: 'compund',
    physics: 'phsics',
    biology: 'bioligy',
    science: 'sciance',
    mathematics: 'mathamatics',
    algorithm: 'algoritm',
    computer: 'computre',
    software: 'softwear',
    system: 'systam',
    diagram: 'daigram',
    theory: 'theorey',
    definition: 'defenition',
    principle: 'principal',
    constant: 'constent',
    variable: 'varible',
    graph: 'graaph',
    measure: 'measur',
    number: 'numbr',
    integer: 'intger',
    vector: 'vecter',
    matrix: 'matirx',
    theorem: 'theroem',
};

// Keyboard adjacency map for realistic slip typos (QWERTY layout)
const KEYBOARD_ADJACENT: Record<string, string[]> = {
    a: ['q', 'w', 's', 'z'],
    b: ['v', 'g', 'h', 'n'],
    c: ['x', 'd', 'f', 'v'],
    d: ['s', 'e', 'r', 'f', 'c', 'x'],
    e: ['w', 's', 'd', 'r'],
    f: ['d', 'r', 't', 'g', 'v', 'c'],
    g: ['f', 't', 'y', 'h', 'b', 'v'],
    h: ['g', 'y', 'u', 'j', 'n', 'b'],
    i: ['u', 'j', 'k', 'o'],
    j: ['h', 'u', 'i', 'k', 'm', 'n'],
    k: ['j', 'i', 'o', 'l', 'm'],
    l: ['k', 'o', 'p'],
    m: ['n', 'j', 'k'],
    n: ['b', 'h', 'j', 'm'],
    o: ['i', 'k', 'l', 'p'],
    p: ['o', 'l'],
    q: ['w', 'a'],
    r: ['e', 'd', 'f', 't'],
    s: ['a', 'w', 'e', 'd', 'x', 'z'],
    t: ['r', 'f', 'g', 'y'],
    u: ['y', 'h', 'j', 'i'],
    v: ['c', 'f', 'g', 'b'],
    w: ['q', 'a', 's', 'e'],
    x: ['z', 's', 'd', 'c'],
    y: ['t', 'g', 'h', 'u'],
};

/**
 * Generate a realistic simulated human typo from a clean word with punctuation preservation
 */
export function generateTypo(word: string, seed: string): string {
    const leadingPunct = word.match(/^[^a-zA-Z0-9]+/)?.[0] || '';
    const trailingPunct = word.match(/[^a-zA-Z0-9]+$/)?.[0] || '';
    const clean = word.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '');
    const cleanLower = clean.toLowerCase();
    if (clean.length < 3) return word;

    let typoWord = clean;

    // 1. Check known typo map
    if (TYPO_MAP[cleanLower]) {
        const mapped = TYPO_MAP[cleanLower];
        typoWord = (clean[0] === clean[0].toUpperCase())
            ? mapped.charAt(0).toUpperCase() + mapped.slice(1)
            : mapped;
        return leadingPunct + typoWord + trailingPunct;
    }

    const rand = getDeterministicRandom(seed + '-typomode');
    const chars = clean.split('');

    if (rand < 0.4 && chars.length > 3) {
        // Swap adjacent letters
        const idx = 1 + Math.floor(getDeterministicRandom(seed + '-swap') * (chars.length - 2));
        const temp = chars[idx];
        chars[idx] = chars[idx + 1];
        chars[idx + 1] = temp;
        typoWord = chars.join('');
    } else if (rand < 0.7) {
        // Adjacent key typo
        const idx = Math.floor(getDeterministicRandom(seed + '-adj') * chars.length);
        const origChar = chars[idx]?.toLowerCase();
        const adjList = origChar ? KEYBOARD_ADJACENT[origChar] : null;
        if (adjList && adjList.length > 0) {
            const replacement = adjList[Math.floor(getDeterministicRandom(seed + '-key') * adjList.length)];
            chars[idx] = chars[idx] === chars[idx]?.toUpperCase() ? replacement.toUpperCase() : replacement;
            typoWord = chars.join('');
        }
    } else if (chars.length >= 3) {
        // Double letter or drop letter
        const idx = Math.floor(getDeterministicRandom(seed + '-drop') * chars.length);
        if (chars[idx] && getDeterministicRandom(seed + '-dd') > 0.5) {
            chars.splice(idx, 0, chars[idx]); // Double letter
        } else if (chars.length > 4) {
            chars.splice(idx, 1); // Drop letter
        }
        typoWord = chars.join('');
    }

    return leadingPunct + typoWord + trailingPunct;
}

/**
 * Parse a raw word into tokens, handling manual syntax (`~~strike~~` or `~~typo~~^correction`)
 * and simulated auto-typos.
 */
export function parseWordToken(
    rawWord: string,
    wordIndex: number,
    lineIndex: number,
    pageIndex: number,
    randomSeed: string,
    autoTypoRate: number,
    strikeStyle: StrikeStyle,
    autoCaret: boolean
): WordToken[] {
    // 0. Check standalone missing-word caret: ^word (e.g. ^to, ^from, ^because, ^at)
    const caretOnlyMatch = rawWord.match(/^\^([a-zA-Z0-9.,!?'"#-]+)$/);
    if (caretOnlyMatch) {
        return [
            {
                text: '',
                isStruck: false,
                strikeStyle,
                caretCorrection: caretOnlyMatch[1],
            },
        ];
    }

    // 1. Check manual strike markup: ~~word~~^correction or ~~word~~
    const strikeWithCaretMatch = rawWord.match(/^~~(.*?)~~\^(.*?)$/);
    if (strikeWithCaretMatch) {
        return [
            {
                text: strikeWithCaretMatch[1],
                isStruck: true,
                strikeStyle,
                caretCorrection: strikeWithCaretMatch[2],
            },
        ];
    }

    const strikeOnlyMatch = rawWord.match(/^~~(.*?)~~$/);
    if (strikeOnlyMatch) {
        return [
            {
                text: strikeOnlyMatch[1],
                isStruck: true,
                strikeStyle,
            },
        ];
    }

    // 2. Check if Auto-Typo should trigger for this word
    // Avoid triggering on tiny words, pure numbers, or punctuation
    const cleanWord = rawWord.replace(/[^a-zA-Z]/g, '');
    if (autoTypoRate > 0 && cleanWord.length >= 4) {
        const wordSeed = `${pageIndex}-${lineIndex}-${wordIndex}-${cleanWord}-${randomSeed}`;
        const typoChance = getDeterministicRandom(wordSeed + '-chance') * 100;

        // Auto typo rate is roughly 0 to 10% (scaled by rate setting)
        if (typoChance < autoTypoRate * 1.8) {
            const misspelled = generateTypo(rawWord, wordSeed);
            if (misspelled !== rawWord) {
                if (autoCaret) {
                    // Struck typo with caret correction above it
                    const correctionText = rawWord;
                    return [
                        {
                            text: misspelled,
                            isStruck: true,
                            strikeStyle,
                            caretCorrection: correctionText,
                            isTypo: true,
                        },
                    ];
                } else {
                    // Struck typo followed immediately by correct word
                    return [
                        {
                            text: misspelled,
                            isStruck: true,
                            strikeStyle,
                            isTypo: true,
                        },
                        {
                            text: rawWord,
                            isStruck: false,
                            strikeStyle,
                        },
                    ];
                }
            }
        }
    }

    // Normal non-struck word
    return [
        {
            text: rawWord,
            isStruck: false,
            strikeStyle,
        },
    ];
}

/**
 * Generate realistic SVG path data for a scratch-out scribble over a word
 */
export function generateScribblePath(
    width: number,
    height: number,
    style: StrikeStyle,
    seed: string
): string {
    const rng = mulberry32(fastStringHash(seed));
    const w = Math.max(width, 14);
    const h = Math.max(height, 16);
    // Center directly on lowercase letter x-height
    const centerY = h * 0.62;
    // Tight bounds so strikes do not overextend past the word
    const startX = -0.5 - rng() * 1.0;
    const endX = w + 0.5 + rng() * 1.0;
    const totalSpan = endX - startX;

    switch (style) {
        case 'underline': {
            // Neat pen underline drawn just below the word baseline
            const underY = h * 0.88 + (rng() - 0.5) * 1.5;
            const yEnd = underY + (rng() - 0.5) * 2;
            const midX = startX + totalSpan * 0.5;
            const midY = underY + (rng() - 0.3) * 1.8;
            return `M ${startX.toFixed(1)} ${underY.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${endX.toFixed(1)} ${yEnd.toFixed(1)}`;
        }

        case 'single': {
            // Swift diagonal pen slash with natural wrist momentum & flick exit
            const y1 = centerY + (rng() - 0.4) * (h * 0.24);
            const y2 = centerY - (rng() - 0.3) * (h * 0.28);
            const cpX = startX + totalSpan * (0.45 + (rng() - 0.5) * 0.12);
            const cpY = centerY + (rng() - 0.5) * 4;
            return `M ${startX.toFixed(1)} ${y1.toFixed(1)} Q ${cpX.toFixed(1)} ${cpY.toFixed(1)} ${endX.toFixed(1)} ${y2.toFixed(1)}`;
        }

        case 'double': {
            // Two rapid parallel horizontal strikes slicing through letters
            const gap = 3.5 + rng() * 2;
            const y1A = centerY - gap + (rng() - 0.5) * 2;
            const y2A = centerY - gap + (rng() - 0.5) * 2;
            const y1B = centerY + gap + (rng() - 0.5) * 2;
            const y2B = centerY + gap + (rng() - 0.5) * 2;
            const cpYA = (y1A + y2A) * 0.5 + (rng() - 0.5) * 2;
            const cpYB = (y1B + y2B) * 0.5 + (rng() - 0.5) * 2;
            return `M ${startX.toFixed(1)} ${y1A.toFixed(1)} Q ${(startX + totalSpan * 0.5).toFixed(1)} ${cpYA.toFixed(1)} ${endX.toFixed(1)} ${y2A.toFixed(1)} ` +
                   `M ${(startX - 1).toFixed(1)} ${y1B.toFixed(1)} Q ${(startX + totalSpan * 0.52).toFixed(1)} ${cpYB.toFixed(1)} ${(endX + 1).toFixed(1)} ${y2B.toFixed(1)}`;
        }

        case 'dense': {
            // Frantic blackout scratch: overlapping loops that actually obscure the mistake
            const passes = Math.max(8, Math.floor(totalSpan / 5));
            const step = totalSpan / passes;
            let d = `M ${startX.toFixed(1)} ${centerY.toFixed(1)}`;
            for (let i = 0; i <= passes; i++) {
                const x = startX + i * step + (rng() - 0.5) * 1.5;
                const topY = centerY - (h * 0.28) + (rng() - 0.5) * 3;
                const botY = centerY + (h * 0.28) + (rng() - 0.5) * 3;
                const y = i % 2 === 0 ? topY : botY;
                const cpx = x - step * 0.4 + (rng() - 0.5) * 2;
                d += ` Q ${cpx.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
            }
            return d;
        }

        case 'coil': {
            // Continuous forward-moving elliptical loops (spring / coil scratch)
            const loops = Math.max(5, Math.floor(totalSpan / 8));
            const step = totalSpan / loops;
            let d = `M ${startX.toFixed(1)} ${(centerY + 1).toFixed(1)}`;
            for (let i = 0; i < loops; i++) {
                const xBase = startX + i * step;
                const topY = centerY - (h * 0.26) + (rng() - 0.5) * 2.5;
                const botY = centerY + (h * 0.26) + (rng() - 0.5) * 2.5;
                const xAdv = xBase + step;
                d += ` C ${(xBase + step * 0.7).toFixed(1)} ${topY.toFixed(1)}, ${(xAdv + step * 0.2).toFixed(1)} ${(centerY - 2).toFixed(1)}, ${xAdv.toFixed(1)} ${botY.toFixed(1)}`;
                d += ` S ${(xBase + step * 0.2).toFixed(1)} ${centerY.toFixed(1)}, ${xAdv.toFixed(1)} ${(centerY + 1).toFixed(1)}`;
            }
            return d;
        }

        case 'zigzag': {
            // Sharp, erratic angular scratch
            const points = Math.max(6, Math.floor(totalSpan / 7));
            const step = totalSpan / points;
            let d = `M ${startX.toFixed(1)} ${centerY.toFixed(1)}`;
            for (let i = 1; i <= points; i++) {
                const x = startX + i * step + (rng() - 0.5) * 2;
                const yOffset = (i % 2 === 0 ? -1 : 1) * (h * 0.26 + (rng() - 0.5) * 3);
                d += ` L ${x.toFixed(1)} ${(centerY + yOffset).toFixed(1)}`;
            }
            return d;
        }

        case 'wavy':
        default: {
            // Natural undulating wave across the word with varied amplitude
            const waves = Math.max(4, Math.floor(totalSpan / 12));
            const step = totalSpan / waves;
            let d = `M ${startX.toFixed(1)} ${(centerY + (rng() - 0.5) * 2).toFixed(1)}`;
            for (let i = 1; i <= waves; i++) {
                const x = startX + i * step;
                const prevX = startX + (i - 1) * step;
                const ySign = i % 2 === 0 ? 1 : -1;
                const amp = (h * 0.22) + (rng() - 0.5) * 2.5;
                const cp1x = prevX + step * 0.33;
                const cp1y = centerY + ySign * amp;
                const cp2x = prevX + step * 0.66;
                const cp2y = centerY - ySign * amp;
                d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${x.toFixed(1)} ${centerY.toFixed(1)}`;
            }
            return d;
        }
    }
}

/**
 * Generate hand-drawn double underline pen paths beneath a word or title
 */
export function generateDoubleUnderlinePath(width: number, height: number, seed: string): string {
    const rng = mulberry32(fastStringHash(seed));
    const w = Math.max(width, 12);
    const h = Math.max(height, 16);
    const startX = -1 - rng() * 1.2;
    const endX = w + 1 + rng() * 1.2;
    const totalSpan = endX - startX;

    // Line 1: just beneath baseline (around h * 0.88)
    const y1A = h * 0.88 + (rng() - 0.5) * 1.2;
    const y1B = y1A + (rng() - 0.4) * 1.2;
    const mid1X = startX + totalSpan * 0.5;
    const mid1Y = y1A + (rng() - 0.2) * 1.5;

    // Line 2: parallel second pen stroke (around h * 0.98)
    const gap = 3.2 + rng() * 1.2;
    const y2A = y1A + gap;
    const y2B = y1B + gap;
    const mid2X = startX + totalSpan * 0.52;
    const mid2Y = mid1Y + gap + (rng() - 0.5) * 0.8;

    return `M ${startX.toFixed(1)} ${y1A.toFixed(1)} Q ${mid1X.toFixed(1)} ${mid1Y.toFixed(1)} ${endX.toFixed(1)} ${y1B.toFixed(1)} ` +
           `M ${(startX + 0.8).toFixed(1)} ${y2A.toFixed(1)} Q ${mid2X.toFixed(1)} ${mid2Y.toFixed(1)} ${(endX - 0.5).toFixed(1)} ${y2B.toFixed(1)}`;
}

/**
 * Generate organic hand-drawn wobbly box enclosing an answer or formula
 */
export function generateWobblyBoxPath(width: number, height: number, seed: string): string {
    const rng = mulberry32(fastStringHash(seed));
    const padX = 3.5;
    const padY = 2;
    const x1 = -padX - (rng() - 0.5) * 1.2;
    const y1 = -padY - (rng() - 0.5) * 1.2;
    const x2 = width + padX + (rng() - 0.5) * 1.2;
    const y2 = height + padY + (rng() - 0.5) * 1.2;

    const topCpY = y1 + (rng() - 0.5) * 1.8;
    const rightCpX = x2 + (rng() - 0.5) * 1.8;
    const botCpY = y2 + (rng() - 0.5) * 1.8;
    const leftCpX = x1 + (rng() - 0.5) * 1.8;

    return `M ${x1.toFixed(1)} ${(y1 + 2).toFixed(1)} ` +
           `Q ${(x1 + (x2 - x1) * 0.5).toFixed(1)} ${topCpY.toFixed(1)} ${(x2 + 0.5).toFixed(1)} ${y1.toFixed(1)} ` +
           `Q ${rightCpX.toFixed(1)} ${(y1 + (y2 - y1) * 0.5).toFixed(1)} ${x2.toFixed(1)} ${(y2 + 1).toFixed(1)} ` +
           `Q ${(x1 + (x2 - x1) * 0.5).toFixed(1)} ${botCpY.toFixed(1)} ${(x1 - 0.5).toFixed(1)} ${y2.toFixed(1)} ` +
           `Q ${leftCpX.toFixed(1)} ${(y1 + (y2 - y1) * 0.5).toFixed(1)} ${x1.toFixed(1)} ${(y1 - 0.5).toFixed(1)}`;
}


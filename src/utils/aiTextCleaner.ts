/**
 * Intelligent AI Text Cleaner & Formatter for text2handwriting.me
 * 
 * Automatically cleans text copied from ChatGPT, Claude, Gemini, DeepSeek, etc.:
 * 1. Strips conversational AI preamble (e.g. "Yes bro — I checked...", "Sure, here is your assignment...")
 * 2. Strips conversational AI sign-offs (e.g. "Hope this helps!", "Let me know if you need anything else!")
 * 3. Converts markdown headings (# Title -> __TITLE__, ## Section -> __Section__, ### Q1. -> Q1.)
 * 4. Normalizes Question/Answer formatting (### Q1. -> Q1., **Ans** / **Answer:** -> Ans:)
 * 5. Cleans random markdown bolding (e.g. **word** -> word) so asterisks don't appear in handwriting
 * 6. Replaces markdown horizontal rules (---, ***) with clean line breaks
 * 7. Standardizes bullets (- or * -> •)
 * 8. Cleans excessive whitespace and blank lines
 */

/**
 * Common patterns of AI introductory greetings, preambles, and filler chatter
 */
const AI_PREAMBLE_PATTERNS: RegExp[] = [
    /^(?:yes|yeah|sure|okay|certainly|hello|hi|hey)\b[^\n]*\b(?:bro|friend|user|mate|sir|ma'?am)?[\s\S]*?(?=\n\s*(?:#|Q\d|Question|\d+[.)]|[A-Z\s]{4,}))/i,
    /^(?:here is|here are|below is|below are|i have (?:prepared|checked|created|written)|i've (?:prepared|checked|created|written))[^\n]*?(?=\n\s*(?:#|Q\d|Question|\d+[.)]|[A-Z\s]{4,}))/i,
    /^(?:certainly|of course|sure thing|no problem)[!,.]?\s*(?:here|below|i'll)[^\n]*?(?=\n\s*(?:#|Q\d|Question|\d+[.)]|[A-Z\s]{4,}))/i,
];

/**
 * Common patterns of AI closing sign-offs and filler chatter at the end of responses
 */
const AI_SIGNOFF_PATTERNS: RegExp[] = [
    /\n+(?:hope this helps|let me know if you (?:have any|need|want)|feel free to ask|good luck with (?:your|the)|all the best|happy (?:studying|writing)|best regards|cheers)[^\n]*$/i,
    /\n+(?:if you need (?:any|more) (?:help|clarification|questions|assistance))[^\n]*$/i,
];

/**
 * Checks whether the given text appears to be AI-generated markdown or contains chat preamble
 */
export function isLikelyAIText(text: string): boolean {
    if (!text || text.length < 20) return false;
    
    // Check for conversational greetings
    const hasGreeting = /^(?:yes bro|sure|certainly|here is|here are|below is|of course|hello|i checked)/i.test(text.trim());
    // Check for markdown headers
    const hasHeaders = /^#{1,4}\s+/m.test(text);
    // Check for markdown bolding or divider lines
    const hasMarkdownBolding = /\*\*[^*]+\*\*/.test(text);
    const hasDividers = /^(?:---|___|\*\*\*)\s*$/m.test(text);
    const hasAIBullets = /^\s*[-*]\s+[A-Za-z]/m.test(text);

    return hasGreeting || (hasHeaders && (hasMarkdownBolding || hasDividers || hasAIBullets));
}

/**
 * Cleans AI-generated text into student-authentic handwritten assignment formatting
 */
export function cleanAIText(raw: string): string {
    if (!raw) return '';

    let cleaned = raw
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');

    // 1. Strip conversational AI preambles
    for (const pattern of AI_PREAMBLE_PATTERNS) {
        cleaned = cleaned.replace(pattern, '').trimStart();
    }

    // Also check first paragraph: if it starts with conversational phrases and does not look like assignment text
    const paragraphs = cleaned.split(/\n\s*\n/);
    if (paragraphs.length > 1) {
        const firstPara = paragraphs[0].trim();
        if (
            /^(?:yes|sure|certainly|here is|here are|below is|i checked|i have|of course|in this assignment|as requested)\b/i.test(firstPara) &&
            !/^#|^(?:Q|Question|\d+[.)])/i.test(firstPara) &&
            firstPara.length < 350
        ) {
            // Remove conversational introductory paragraph
            paragraphs.shift();
            cleaned = paragraphs.join('\n\n');
        }
    }

    // 2. Strip conversational AI sign-offs at the end
    for (const pattern of AI_SIGNOFF_PATTERNS) {
        cleaned = cleaned.replace(pattern, '').trimEnd();
    }

    // 3. Process line by line for structured formatting
    const lines = cleaned.split('\n');
    const processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trimEnd();

        // Check for horizontal dividers (---, ***, ___)
        if (/^(?:---|___|\*\*\*)\s*$/.test(line)) {
            // Replace divider with empty line to keep clean paragraph separation
            if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
                processedLines.push('');
            }
            continue;
        }

        // Main Document Title (# Title)
        const h1Match = line.match(/^#\s+(.+)$/);
        if (h1Match) {
            const titleText = h1Match[1].replace(/\*\*/g, '').trim().toUpperCase();
            if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
                processedLines.push('');
            }
            processedLines.push(`__${titleText}__`);
            processedLines.push('');
            continue;
        }

        // Section Heading (## Section)
        const h2Match = line.match(/^##\s+(.+)$/);
        if (h2Match) {
            const sectionText = h2Match[1].replace(/\*\*/g, '').trim();
            if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
                processedLines.push('');
            }
            processedLines.push(`__${sectionText}__`);
            processedLines.push('');
            continue;
        }

        // Question Heading (### Q1. or ### Question 1: or #### Q1.)
        const questionMatch = line.match(/^#{3,6}\s*(Q(?:uestion)?[\s.:\d]+.*)$/i);
        if (questionMatch) {
            const qText = questionMatch[1].replace(/\*\*/g, '').trim();
            if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
                processedLines.push('');
            }
            processedLines.push(qText);
            continue;
        }

        // Generic Sub-Heading (### Subheading)
        const h3Match = line.match(/^#{3,6}\s+(.+)$/);
        if (h3Match) {
            const subText = h3Match[1].replace(/\*\*/g, '').trim();
            if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
                processedLines.push('');
            }
            processedLines.push(subText);
            continue;
        }

        // Answer Indicator (**Ans**, **Ans:**, **Answer:**, Ans:, Answer:)
        const ansMatch = line.match(/^(\s*)(?:\*\*|\*|__)?(Ans(?:wer)?[:.-]?)?(?:\*\*|\*|__)?(?:\s*(.*))$/i);
        if (ansMatch && ansMatch[2]) {
            const trailing = ansMatch[3] ? ansMatch[3].trim() : '';
            if (trailing) {
                processedLines.push(`Ans: ${trailing.replace(/\*\*/g, '')}`);
            } else {
                processedLines.push('Ans:');
            }
            continue;
        }

        // Standardize bullet points (* or - -> •)
        const bulletMatch = line.match(/^(\s*)(?:[-*])\s+(.*)$/);
        if (bulletMatch) {
            const indent = bulletMatch[1];
            const content = bulletMatch[2].replace(/\*\*/g, '');
            processedLines.push(`${indent}• ${content}`);
            continue;
        }

        // Clean inline asterisks: **important** -> important
        line = line.replace(/\*\*([^*]+)\*\*/g, '$1');
        line = line.replace(/\*([^*\s][^*]*[^*\s])\*/g, '$1');
        // Clean any ==highlight== syntax
        line = line.replace(/==(?:yellow:|green:|pink:|blue:)?([^=]+)==/gi, '$1');

        processedLines.push(line);
    }

    // Join and clean up excessive blank lines
    let result = processedLines.join('\n');
    result = result.replace(/\n{3,}/g, '\n\n').trim();

    return result;
}

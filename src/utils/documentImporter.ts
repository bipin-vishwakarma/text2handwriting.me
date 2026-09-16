/**
 * Intelligent Document Importer for text2handwriting.me
 * 
 * Extracts and normalizes text from various file formats:
 * - .docx (Microsoft Word documents via mammoth)
 * - .pdf (PDF files via pdfjs-dist)
 * - .md / .markdown (Markdown notes via FileReader)
 * - .txt / .rtf (Plain and Rich Text)
 * - .png / .jpg / .jpeg / .webp (Image OCR via tesseract.js)
 */

import { cleanAIText, isLikelyAIText } from './aiTextCleaner';

export interface ImportedDocument {
    text: string;
    title: string;
    wordCount: number;
    originalFormat: string;
    pageCount?: number;
}

/**
 * Extracts a clean display title from a filename
 * e.g. "usability_of_biomedical_devices_v2.docx" -> "Usability Of Biomedical Devices V2"
 */
export function extractTitleFromFileName(fileName: string): string {
    const base = fileName.replace(/\.[^/.]+$/, '').trim();
    if (!base) return 'Untitled Document';
    
    // Replace underscores, hyphens, and multiple spaces with a single space
    const withSpaces = base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Title Case formatting
    return withSpaces
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Strips RTF control codes and groups to extract plain text
 */
function stripRtf(rtf: string): string {
    return rtf
        .replace(/\\par[d]?/g, '\n')
        .replace(/\{\*?\\[^{}]+;?\}|[{}]|\\\n?[A-Za-z0-9]+ ?/g, '')
        .replace(/\\\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Imports and extracts text from a .docx file using mammoth
 */
async function importDocx(file: File, onProgress?: (msg: string) => void): Promise<string> {
    onProgress?.('Reading Word document...');
    const arrayBuffer = await file.arrayBuffer();
    
    // Dynamic import of mammoth to keep main bundle lean
    const mammoth = await import('mammoth');
    
    try {
        onProgress?.('Converting Word formatting...');
        // First attempt markdown conversion to preserve headings and bullet lists
        const mdResult = await (mammoth as unknown as { convertToMarkdown: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> }).convertToMarkdown({ arrayBuffer });
        if (mdResult?.value && mdResult.value.trim().length > 0) {
            // Mammoth backslash-escapes markdown punctuation like \#, \., \-, \*, \_
            // Unescape them so cleanAIText and handwriting styling engines format headings, numbers, and bullets properly
            return mdResult.value.replace(/\\([#*_`~[\]().!+-])/g, '$1');
        }
    } catch {
        // Fallback to raw text extraction if markdown conversion fails
    }

    onProgress?.('Extracting document text...');
    const rawResult = await mammoth.extractRawText({ arrayBuffer });
    return rawResult.value || '';
}

/**
 * Imports and extracts text from a .pdf file using pdfjs-dist
 */
async function importPdf(file: File, onProgress?: (msg: string) => void): Promise<{ text: string; pageCount: number }> {
    onProgress?.('Loading PDF document...');
    const arrayBuffer = await file.arrayBuffer();

    // Dynamic import of pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');

    // Configure worker with reliable fallback
    try {
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '5.4.449'}/build/pdf.worker.min.mjs`;
        }
    } catch {
        // Fallback if version lookup fails
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.449/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
        isEvalSupported: false,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const extractedPages: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        onProgress?.(`Extracting PDF page ${pageNum} of ${numPages}...`);
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Sort items vertically (top-to-bottom), then horizontally (left-to-right)
        interface ExtractedWord {
            str: string;
            transform: number[];
        }
        const items: ExtractedWord[] = [];
        for (const item of textContent.items) {
            if ('str' in item && typeof item.str === 'string' && item.str.trim().length > 0 && 'transform' in item && Array.isArray(item.transform)) {
                items.push({
                    str: item.str,
                    transform: item.transform,
                });
            }
        }

        if (items.length === 0) continue;

        // Group into lines based on Y position (threshold ~5px)
        const lines: { y: number; text: string }[] = [];
        let currentLineY = items[0].transform[5];
        let currentLineWords: { x: number; str: string }[] = [];

        for (const item of items) {
            const itemY = item.transform[5];
            const itemX = item.transform[4];

            if (Math.abs(itemY - currentLineY) > 5) {
                // Flush line
                if (currentLineWords.length > 0) {
                    currentLineWords.sort((a, b) => a.x - b.x);
                    lines.push({ y: currentLineY, text: currentLineWords.map(w => w.str).join(' ') });
                    currentLineWords = [];
                }
                currentLineY = itemY;
            }
            currentLineWords.push({ x: itemX, str: item.str });
        }
        if (currentLineWords.length > 0) {
            currentLineWords.sort((a, b) => a.x - b.x);
            lines.push({ y: currentLineY, text: currentLineWords.map(w => w.str).join(' ') });
        }

        const pageText = lines.map(l => l.text).join('\n');
        if (pageText.trim()) {
            extractedPages.push(pageText);
        }
    }

    // If PDF text layer was completely empty (e.g. scanned PDF document), perform OCR via Tesseract.js
    if (extractedPages.length === 0 || extractedPages.join('').trim().length < 20) {
        onProgress?.('Scanned PDF detected. Initializing OCR engine...');
        try {
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('eng');
            
            for (let pageNum = 1; pageNum <= Math.min(numPages, 5); pageNum++) {
                onProgress?.(`Running OCR on scanned page ${pageNum}...`);
                const page = await pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const pageRenderer = page as unknown as { render: (opts: unknown) => { promise: Promise<void> } };
                    await pageRenderer.render({ canvasContext: ctx, viewport }).promise;
                    const ocrRes = await worker.recognize(canvas);
                    if (ocrRes.data?.text?.trim()) {
                        extractedPages.push(ocrRes.data.text.trim());
                    }
                }
            }
            await worker.terminate();
        } catch (ocrErr) {
            console.warn('PDF OCR fallback error:', ocrErr);
        }
    }

    return {
        text: extractedPages.join('\n\n'),
        pageCount: numPages
    };
}

/**
 * Extracts text from images using Tesseract OCR
 */
async function importImageOcr(file: File, onProgress?: (msg: string) => void): Promise<string> {
    onProgress?.('Initializing Optical Character Recognition (OCR)...');
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');

    onProgress?.('Scanning image for handwritten & printed text...');
    const ret = await worker.recognize(file);
    await worker.terminate();

    return ret.data.text || '';
}

/**
 * Master import function handling all supported document types
 */
export async function importDocumentFile(
    file: File,
    onProgress?: (status: string) => void
): Promise<ImportedDocument> {
    const fileName = file.name;
    const lowerName = fileName.toLowerCase();
    const derivedTitle = extractTitleFromFileName(fileName);
    let extractedText = '';
    let pageCount: number | undefined;
    let format = 'text';

    if (lowerName.endsWith('.docx')) {
        format = 'Word (.docx)';
        extractedText = await importDocx(file, onProgress);
    } else if (lowerName.endsWith('.pdf')) {
        format = 'PDF (.pdf)';
        const pdfResult = await importPdf(file, onProgress);
        extractedText = pdfResult.text;
        pageCount = pdfResult.pageCount;
    } else if (lowerName.endsWith('.md') || lowerName.endsWith('.markdown')) {
        format = 'Markdown (.md)';
        onProgress?.('Reading Markdown file...');
        extractedText = await file.text();
    } else if (lowerName.endsWith('.rtf')) {
        format = 'Rich Text (.rtf)';
        onProgress?.('Reading Rich Text file...');
        const rtfContent = await file.text();
        extractedText = stripRtf(rtfContent);
    } else if (/\.(png|jpe?g|webp)$/i.test(lowerName)) {
        format = 'Image OCR';
        extractedText = await importImageOcr(file, onProgress);
    } else {
        // Fallback for .txt, .csv, code files, or unknown text formats
        format = 'Plain Text (.txt)';
        onProgress?.('Reading text file...');
        extractedText = await file.text();
    }

    // Auto-normalize if text has AI or markdown markers
    if (isLikelyAIText(extractedText) || /^#{1,4}\s+/m.test(extractedText)) {
        onProgress?.('Formatting headings and student layout...');
        extractedText = cleanAIText(extractedText);
    }

    const trimmed = extractedText.trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

    return {
        text: trimmed,
        title: derivedTitle,
        wordCount,
        originalFormat: format,
        pageCount
    };
}

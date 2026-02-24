import * as pdfjsLib from 'pdfjs-dist'

// Point the worker to the bundled version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString()

/**
 * Extract all text from a PDF File object.
 * Returns an array of page text strings.
 */
export async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const pages = []

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
            .map((item) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
        pages.push(pageText)
    }

    return pages.join('\n\n')
}

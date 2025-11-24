export async function extractTextFromFile(url: string, filename: string): Promise<string> {
    try {
        // Fetch the file from the URL
        const response = await fetch(url)
        if (!response.ok) {
            console.error('Failed to fetch file:', response.statusText)
            return ''
        }

        // Get file extension
        const ext = filename.toLowerCase().split('.').pop()

        if (ext === 'pdf') {
            // Extract text from PDF
            const arrayBuffer = await response.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            // Use require for CommonJS module
            const pdfParse = require('pdf-parse')
            const data = await pdfParse(buffer)
            return data.text || ''
        } else if (ext === 'txt' || ext === 'md') {
            // Extract text from plain text files
            return await response.text()
        } else {
            console.warn('Unsupported file type:', ext)
            return ''
        }
    } catch (error) {
        console.error('Error extracting text from file:', error)
        return ''
    }
}

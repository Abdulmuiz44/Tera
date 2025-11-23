/**
 * Compresses an image file using the HTML Canvas API.
 * Resizes large images to a max dimension of 1920px and compresses to JPEG with 0.7 quality.
 */
export async function compressImage(file: File): Promise<File> {
    // Only compress images
    if (!file.type.startsWith('image/')) {
        return file
    }

    // If image is small (< 1MB), return original
    if (file.size < 1024 * 1024) {
        return file
    }

    return new Promise((resolve, reject) => {
        const img = new Image()
        const reader = new FileReader()

        reader.onload = (e) => {
            img.src = e.target?.result as string
        }

        reader.onerror = (e) => reject(e)

        img.onload = () => {
            const canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height
            const maxDim = 1920

            // Calculate new dimensions
            if (width > maxDim || height > maxDim) {
                if (width > height) {
                    height = Math.round((height * maxDim) / width)
                    width = maxDim
                } else {
                    width = Math.round((width * maxDim) / height)
                    height = maxDim
                }
            }

            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('Could not get canvas context'))
                return
            }

            // Draw image to canvas
            ctx.drawImage(img, 0, 0, width, height)

            // Convert to blob (JPEG, 0.7 quality)
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Image compression failed'))
                        return
                    }
                    // Create new file from blob
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    })
                    resolve(compressedFile)
                },
                'image/jpeg',
                0.7
            )
        }

        reader.readAsDataURL(file)
    })
}

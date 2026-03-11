import jimp from 'jimp';

const inputPath = 'c:\\Users\\Hp\\Documents\\Github\\Tera\\public\\images\\TERA_LOGO_ONLY.png';
const outputPath = 'c:\\Users\\Hp\\Documents\\Github\\Tera\\public\\images\\TERA_LOGO_ONLY1.png';

async function recolorLogo() {
    try {
        const img = await jimp.read(inputPath);
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x: number, y: number, idx: number) {
            const alpha = this.bitmap.data[idx + 3];
            // Check if the pixel is not fully transparent
            if (alpha > 0) {
                // Change visible pixels to black, preserving alpha
                this.bitmap.data[idx] = 0;     // Red
                this.bitmap.data[idx + 1] = 0; // Green
                this.bitmap.data[idx + 2] = 0; // Blue
            }
        });

        await img.writeAsync(outputPath);
        console.log(`Successfully created ${outputPath}`);
    } catch (err) {
        console.error(`Error: ${err}`);
    }
}

recolorLogo();

#!/usr/bin/env node
import { execFileSync } from 'child_process';
import fs from 'fs';

function fixVideoCodec(inputFile: string = "output.mp4", outputFile: string = "output_fixed.mp4"): boolean {
    if (!fs.existsSync(inputFile)) {
        console.error(`Error: ${inputFile} not found`);
        return false;
    }

    console.log(`Converting ${inputFile} to compatible format...`);
    console.log("This may take a few minutes...");

    try {
        const cmd = 'ffmpeg';
        const args = [
            '-i', inputFile,
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-movflags', '+faststart',
            outputFile
        ];

        execFileSync(cmd, args, { encoding: 'utf8' });

        console.log(`✓ Video successfully converted to ${outputFile}`);

        const inputSize = fs.statSync(inputFile).size / (1024 * 1024);
        const outputSize = fs.statSync(outputFile).size / (1024 * 1024);
        console.log(`  Original: ${inputSize.toFixed(1)} MB`);
        console.log(`  Optimized: ${outputSize.toFixed(1)} MB`);

        const backupFile = `${inputFile}.backup`;
        if (!fs.existsSync(backupFile)) {
            fs.renameSync(inputFile, backupFile);
            console.log(`  Original saved as: ${backupFile}`);
        }

        fs.renameSync(outputFile, inputFile);
        console.log(`  Replaced ${inputFile} with fixed version`);

        return true;
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            console.error("Error: ffmpeg not found. Please install FFmpeg:");
            console.error("  Windows: choco install ffmpeg");
            console.error("  macOS: brew install ffmpeg");
            console.error("  Linux: sudo apt-get install ffmpeg");
        } else {
            console.error(`Error during conversion: ${err.stderr || err.message}`);
        }
        return false;
    }
}

if (require.main === module) {
    console.log("=".repeat(60));
    console.log("VIDEO CODEC FIXER");
    console.log("=".repeat(60));

    const success = fixVideoCodec();

    if (success) {
        console.log("\n✓ Video is now compatible with all players");
    } else {
        console.log("\n✗ Failed to fix video codec");
    }
}

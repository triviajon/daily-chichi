import assert from "assert";
import { Canvas, CanvasRenderingContext2D, createCanvas, loadImage } from "canvas";

export enum HashingAlgorithm {
    AverageHash,
}

export async function hash(imageData: string, hashingAlgorithm: HashingAlgorithm): Promise<string> {
    switch (hashingAlgorithm) {
    default:
        return calculateAverageHash(imageData);
    }
}
      
async function calculateAverageHash(imageData: string): Promise<string> {
    const canvas: Canvas = createCanvas(8, 8);
    const context: CanvasRenderingContext2D = canvas.getContext("2d");

    const base64Data: string = imageData.split(",")[1] ?? 
        assert.fail("This is an invalid data URL!");
    const buffer = Buffer.from(base64Data, "base64");
    const image = await loadImage(buffer);

    context.drawImage(image, 0, 0, 8, 8);

    const averagedValues: Array<number> = [];
    const pixelData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < pixelData.length; i += 4) {
        const r: number = pixelData[i] ?? assert.fail("Missing pixel data");
        const g: number = pixelData[i + 1] ?? assert.fail("Missing pixel data");
        const b: number = pixelData[i + 2] ?? assert.fail("Missing pixel data");
        averagedValues.push(r + g + b);
    }
    const averageValue = averagedValues
        .reduce((prev: number, next: number) => prev + next, 0) / averagedValues.length;

    // Generate the hash based on pixel intensity
    const isBrighter: Array<boolean> = [];
    for (let i = 0; i < pixelData.length; i += 4) {
        const r: number = pixelData[i] ?? assert.fail("Missing pixel data");
        const g: number = pixelData[i + 1] ?? assert.fail("Missing pixel data");
        const b: number = pixelData[i + 2] ?? assert.fail("Missing pixel data");
        isBrighter.push(r + g + b > averageValue);
    }

    return isBrighter.map(b => b ? "1" : "0").join("");
}
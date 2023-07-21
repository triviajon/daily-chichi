import assert from "assert";

export enum HashingAlgorithm {
    AverageHash,
}

export async function hash(imageData: string, hashingAlgorithm: HashingAlgorithm): Promise<string> {
    const image: HTMLImageElement = new Image();
    image.src = imageData;

    const calculateHashPromise: Promise<string> = new Promise<string>((resolve, reject) => {
        switch (hashingAlgorithm) {
            default:
                image.onload = () => calculateAverageHash(image);
        }
    });

    return await calculateHashPromise;
}
      
function calculateAverageHash(image: HTMLImageElement): string {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const context: CanvasRenderingContext2D = canvas.getContext('2d') ?? assert.fail("Failed to create canvas");
    
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

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

    return isBrighter.map(b => b ? '1' : '0').join('');
}
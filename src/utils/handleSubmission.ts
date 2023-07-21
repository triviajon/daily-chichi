import fs from 'fs';
import path from 'path';
import { PostPayload } from '../PostPayload';
import { HashingAlgorithm, hash } from './hash';
import { Config } from '../Config';

export enum HandlingResult {
    ACCEPTED,
    MISSING_ITEM,
    REPOST,
    INTERNAL_ERROR
}

export function handleRequest(payload: PostPayload, config: Config): HandlingResult {
    try {
        return _handleRequest(payload, config);
    } catch (e) {
        return HandlingResult.INTERNAL_ERROR;
    }
}

function _handleRequest(payload: PostPayload, config: Config): HandlingResult {
    const name: string = payload.name;
    const caption: string = payload.caption;
    const imageData: string = payload.imageCanvas;

    if ([name, imageData, caption].some(isEmpty)) {
        return HandlingResult.MISSING_ITEM;
    }

    if (haveSeenBefore(imageData, config)) {
        return HandlingResult.REPOST;
    }

    saveRequest(name, caption, imageData, config);

    return HandlingResult.ACCEPTED;
}

function base64ToBuffer(base64: string): Buffer {
    return Buffer.from(base64.replace(/^data:image\/png;base64,/, ''), 'base64');
}

function saveAsPNG(buffer: Buffer, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            console.error('Error saving PNG file:', err);
            reject(err);
        } else {
            console.log('File saved successfully!');
            resolve();
            }
        });
    });
}

async function saveRequest(name: string, caption: string, imageData: string, config: Config): Promise<void> {
    const imagesDirectory: string = config.storeImagesDir;
    const hashesFilePath: string = config.storeHashesPath;
    const imageHash: string = await hash(imageData, HashingAlgorithm.AverageHash);

    console.log(imagesDirectory, hashesFilePath, imageHash);

    storeHash(imageHash, hashesFilePath);
    storeImage(imageData, imageHash, imagesDirectory);
    storeMeta(name, caption, imagesDirectory);
}

function storeHash(imageHash: string, hashesFilePath: string): void {
    if (!fs.existsSync(hashesFilePath)) {
        fs.writeFileSync(hashesFilePath, "");
    }

    fs.appendFileSync(hashesFilePath, imageHash + '\n');
}

function storeImage(imageData: string, imageHash: string, imagesDirectory: string): void {
    const thisImageDir: string = path.join(imagesDirectory, imageHash)
    fs.mkdirSync(thisImageDir);
    saveAsPNG(base64ToBuffer(imageData), path.join(thisImageDir, "image.png"));
}

function storeMeta(name: string, caption: string, imagesDirectory: string): void {
    const data: string = JSON.stringify({
        "name": name,
        "caption": caption
    });

    fs.writeFileSync(path.join(imagesDirectory, "info.json"), data);
}



function isEmpty(input: string): boolean {
    return input === undefined || input === null || input.length === 0;
}

function haveSeenBefore(imageHash: string, config: Config) {
    return false;
}

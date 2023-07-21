import fs from 'fs';
import { PostPayload } from '../PostPayload';
import { HashingAlgorithm, hash } from './hash';

export enum HandlingResult {
    ACCEPTED,
    MISSING_ITEM,
    REPOST,
    INTERNAL_ERROR
}

export function handleRequest(payload: PostPayload, savePath: string): HandlingResult {
    try {
        return _handleRequest(payload, savePath);
    } catch (e) {
        return HandlingResult.INTERNAL_ERROR;
    }
}

function _handleRequest(payload: PostPayload, savePath: string): HandlingResult {
    const name: string = payload.name;
    const caption: string = payload.caption;
    const imageData: string = payload.imageCanvas;

    if ([name, imageData, caption].some(isEmpty)) {
        return HandlingResult.MISSING_ITEM;
    }

    if (haveSeenBefore(imageData)) {
        return HandlingResult.REPOST;
    }

    saveRequest(name, caption, imageData);

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

async function saveRequest(name: string, caption: string, imageData: string): Promise<void> {
    const imageHash: string = await hash(imageData, HashingAlgorithm.AverageHash);
    // For now, disregard the hash.
}



function isEmpty(input: string): boolean {
    return input === undefined || input === null || input.length === 0;
}

function haveSeenBefore(imageData: string) {
    return false;
}

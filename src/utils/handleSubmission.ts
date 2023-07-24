import path from "path";
import { PostPayload } from "../PostPayload";
import { HashingAlgorithm, hash } from "./hash";
import { Config } from "../Config";
import { WriteOptions, writeToFile } from "./files";
import { PostMetadata } from "./PostMetadata";
import { v4 as uuidv4 } from "uuid";

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
    return Buffer.from(base64.replace(/^data:image\/png;base64,/, ""), "base64");
}

async function saveRequest(
    name: string, 
    caption: string, 
    imageData: string, 
    config: Config
): Promise<void> {
    const imagesDirectory: string = config.storeImagesDir;
    const hashesFilePath: string = config.storeHashesPath;
    const imageHash: string = await hash(imageData, HashingAlgorithm.AverageHash);

    const uuid: string = uuidv4();

    console.log(imagesDirectory, hashesFilePath, imageHash);

    storeHash(imageHash, hashesFilePath);
    storeImage(imageData, uuid, imagesDirectory);
    storeMeta(name, caption, imageHash, uuid, imagesDirectory);
}

function storeHash(imageHash: string, hashesFilePath: string): void {
    const writeOptions: WriteOptions = {
        recursive: true,
        overwrite: false,
        append: true,
        verbose: true,
    };

    writeToFile(hashesFilePath, imageHash, writeOptions);
}

function storeImage(imageData: string, uuid: string, imagesDirectory: string): void {
    const writeOptions: WriteOptions = {
        recursive: true,
        overwrite: false,
        append: false,
        verbose: true,
    };
    
    const imageBuffer: Buffer = base64ToBuffer(imageData);
    const filename: string = path.join(imagesDirectory, uuid, "image.png");
    writeToFile(filename, imageBuffer, writeOptions);
}

function storeMeta(
    dateCaptured: string, 
    caption: string, 
    imageHash: string, 
    uuid: string,
    imagesDirectory: string
): void {
    const writeOptions: WriteOptions = {
        recursive: true,
        overwrite: false,
        append: false,
        verbose: true,
    };

    const data: PostMetadata = {
        dateCaptured: dateCaptured,
        caption: caption,
        imageHash: imageHash,
        uuid: uuid
    };
    const dataString: string = JSON.stringify(data);
    const filename: string = path.join(imagesDirectory, uuid, "info.json");
    writeToFile(filename, dataString, writeOptions);
}



function isEmpty(input: string): boolean {
    return input === undefined || input === null || input.length === 0;
}

/* eslint-disable */
function haveSeenBefore(imageHash: string, config: Config) {
    console.error("haveSeenBefore has not been implemented yet! returning false");
    return false;
}

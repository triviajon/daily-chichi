import fs from "fs";
import path from "path";

export interface WriteOptions {
    /**
     * If set to true, will recursively attempt create directories.
     * Defaults to false.
     */
    recursive: boolean;
    /**
     * If set to true, will overwrite the file contents if it exists.
     * Defaults to false.
     */
    overwrite: boolean;
    /**
     * If set to true, will append to the end of a file if it exists,
     * else creates a new file. If set to true, overwrite must be false.
     * Defaults to false.
     */
    append: boolean
    /**
     * If set to false, will log no information to the console.
     * Defaults to false.
     */
    verbose: boolean;
}

const DEFAULT_WRITE_OPTIONS: WriteOptions = {
    recursive: false,
    overwrite: false,
    append: false,
    verbose: true,
};

/**
 * 
 * @param filename the full path to the file that you wish to (over)write
 * @param data the data to write in the file
 * @param writeOptions options
 * @throws an error if the parent does not exist recursive=false, or if the file exists
 * but overwrite=false
 */
export function writeToFile(
    filename: string, 
    data: string | Buffer, 
    options: WriteOptions = DEFAULT_WRITE_OPTIONS
): void {
    const parentDirectory: string = path.dirname(filename);
    
    if (!fs.existsSync(parentDirectory) && !options.recursive) {
        throw new Error("Parent directory doesn't exist!");
    } else if (!fs.existsSync(parentDirectory)) {
        if (options.verbose) console.log("Recursively creating directories!");
        fs.mkdirSync(parentDirectory, { recursive: true });
    }

    if (fs.existsSync(filename) && !options.overwrite && !options.append) {
        throw new Error("The file already exists!");
    }

    if (options.append && options.overwrite) {
        throw new Error("Append and overwrite cannot both be true!");
    }

    try {
        if (fs.existsSync(filename) && options.overwrite) {
            fs.writeFileSync(filename, data);
            console.log("File has been overwritten successfully.");
        } else if (!fs.existsSync(filename) || (fs.existsSync(filename) && options.append)) {
            fs.appendFileSync(filename, data);
        }
    } catch (e) {
        console.error("Error writing to file!", e);
        throw e;
    }
}
import fs from "fs";

export interface Config {
    storeImagesDir: string;
    storeHashesPath: string;
}

/**
 * 
 * @param filePath the filepath where the config file is loaded
 * @returns the configuration if it exists, or null otherwise
 */
export function readConfig(filePath: string): Config | null {
    try {
        const rawData = fs.readFileSync(filePath, "utf8");
        const parsedData = JSON.parse(rawData) as Config;
        if (!parsedData.storeHashesPath || !parsedData.storeImagesDir) {
            throw new Error("Missing configuration properties.");
        }
        return parsedData;
    } catch (error) {
        console.error("Error reading or parsing the Config file:", error);
        return null;
    }
}
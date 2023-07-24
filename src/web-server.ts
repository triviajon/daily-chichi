
import express, { Request, Response } from "express";
import cors from "cors";
import HttpStatus from "http-status-codes";
import asyncHandler from "express-async-handler";
import { handleRequest, HandlingResult } from "./utils/handleSubmission";
import { PostPayload } from "./PostPayload";
import { Config, readConfig } from "./Config";
import path from "path";
import assert from "assert";

const app = express();

const DEFAULT_PORT = 8789;
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const homeDir: string = process.env["HOME"] ?? assert.fail("Cannot find $HOME dir!");
const configFilePath: string = path.join(homeDir, ".config", "daily-chichi", "config.json");
const config: Config = readConfig(configFilePath) ?? assert.fail("Something went wrong!"); 

app.get("/", asyncHandler(async (request: Request, response: Response) => {
    response
        .status(HttpStatus.OK)
        .type("text")
        .send("Hello!"); 
}));

app.post("/submit", asyncHandler(async (request: Request, response: Response) => {
    const payload: PostPayload = request.body;
    const handlingResult: HandlingResult = handleRequest(payload, config); 
    
    switch (handlingResult) {
    case(HandlingResult.ACCEPTED): 
        response
            .status(HttpStatus.ACCEPTED)
            .send();
        return;
    default:
        response
            .status(HttpStatus.BAD_REQUEST)
            .send();
        return;
    }
}));

/**
 * Starts a server.
 * 
 * @param port the port to listen on. defaults to 8789
 */
export async function startServer(port=DEFAULT_PORT): Promise<() => void> {
    const server = app.listen(port);
    console.log(`now listening at http://localhost:${port}`);
    const x = (): void => {server.close();};
    return x;
}

/**
 * Runs startServer().
 */
async function main(): Promise<void> {
    await startServer();
}

if (require.main === module) {
    void main();
}

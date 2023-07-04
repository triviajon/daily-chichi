
import express, { Request, Response } from 'express';
import cors from 'cors';
import HttpStatus from 'http-status-codes';
import asyncHandler from 'express-async-handler';

const app = express();

const DEFAULT_PORT = 8789;
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());

app.get('/', asyncHandler(async (request: Request, response: Response) => {
    response
        .status(HttpStatus.OK)
        .type('text')
        .send("Hello!"); 
}));

app.post('/submit', asyncHandler(async (request: Request, response: Response) => {
    // TODO: Implement submission handling logic.

    console.log(request.body);
    response
        .status(HttpStatus.OK)
        .type('text')
        .send(request.body); 
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

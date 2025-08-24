import { Express } from 'express';
import { WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
export interface McpServer {
    app: Express;
    server: HttpServer;
    wss: WebSocketServer;
}
export declare function createServer(): McpServer;
export declare function start(port?: number): void;
declare const _default: {
    createServer: typeof createServer;
    start: typeof start;
};
export default _default;

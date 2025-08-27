import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { WebSocketServer } from 'ws';
import http from 'http';
import pino from 'pino';
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
export function createServer() {
    const app = express();
    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: '2mb' }));
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server, path: '/ws' });
    wss.on('connection', (ws) => {
        logger.info('ws connected');
        ws.send(JSON.stringify({ type: 'hello', ts: Date.now() }));
    });
    app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));
    app.post('/run', async (req, res) => {
        const payload = req.body ?? {};
        wss.clients.forEach((client) => {
            if (client.readyState === 1)
                client.send(JSON.stringify({ type: 'run', payload }));
        });
        res.json({ accepted: true });
    });
    return { app, server, wss };
}
export function start(port = Number(process.env.PORT || 3333)) {
    const { server } = createServer();
    server.listen(port, () => {
        logger.info({ port }, 'MCP server listening');
    });
}
const mcp = { createServer, start };
export default mcp;

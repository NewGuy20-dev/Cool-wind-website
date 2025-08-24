import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { WebSocketServer, WebSocket } from 'ws';
import http, { Server as HttpServer } from 'http';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export interface McpServer {
	app: Express;
	server: HttpServer;
	wss: WebSocketServer;
}

export function createServer(): McpServer {
	const app: Express = express();
	app.use(helmet());
	app.use(cors());
	app.use(express.json({ limit: '2mb' }));

	const server: HttpServer = http.createServer(app);
	const wss: WebSocketServer = new WebSocketServer({ server, path: '/ws' });

	wss.on('connection', (ws: WebSocket) => {
		logger.info('ws connected');
		ws.send(JSON.stringify({ type: 'hello', ts: Date.now() }));
	});

	app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok', ts: Date.now() }));

	app.post('/run', async (req: Request, res: Response) => {
		const payload = (req as any).body ?? {};
		wss.clients.forEach((client: any) => {
			if (client.readyState === 1) client.send(JSON.stringify({ type: 'run', payload }));
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

export default { createServer, start };
import puppeteer, { Browser, Page } from 'puppeteer';
import firefox from 'puppeteer-firefox';

export type BrowserType = 'chrome' | 'firefox';

export interface RunOptions {
	url: string;
	routePath?: string;
	browser: BrowserType;
	headless?: boolean;
	viewport?: { width: number; height: number };
	timeoutMs?: number;
	retries?: number;
	screenshotDir?: string;
}

export interface RunResult {
	success: boolean;
	attempts: number;
	pageLoadMs: number;
	screenshotPath?: string;
	meta: Record<string, unknown>;
}

async function launchBrowser(browser: BrowserType, headless: boolean): Promise<Browser> {
	if (browser === 'firefox') {
		return await (firefox as any).launch({ headless });
	}
	return await puppeteer.launch({ headless });
}

async function ensurePage(browser: Browser, viewport?: { width: number; height: number }): Promise<Page> {
	const page = await browser.newPage();
	if (viewport) {
		await page.setViewport(viewport);
	}
	return page;
}

function delay(ms: number): Promise<void> { return new Promise(res => setTimeout(res, ms)); }
function now(): number { return Date.now(); }

export async function runToMlRoute(options: RunOptions): Promise<RunResult> {
	const {
		url,
		routePath = '/ml',
		browser,
		headless = true,
		viewport = { width: 1366, height: 768 },
		timeoutMs = 30000,
		retries = 2,
		screenshotDir = 'screenshots'
	} = options;

	let attempts = 0;
	let lastError: unknown = undefined;
	const startAll = now();

	while (attempts <= retries) {
		attempts++;
		let b: Browser | null = null;
		try {
			b = await launchBrowser(browser, headless);
			const page = await ensurePage(b, viewport);
			const targetUrl = new URL(routePath, url).toString();
			const start = now();
			await page.goto(targetUrl, { timeout: timeoutMs, waitUntil: 'networkidle2' });
			const pageLoadMs = now() - start;
			await delay(500);
			const fs = await import('fs');
			const path = await import('path');
			const ts = new Date().toISOString().replace(/[:.]/g, '-');
			const fileBase = `${browser}-${ts}`;
			const dir = path.resolve(process.cwd(), screenshotDir);
			fs.mkdirSync(dir, { recursive: true });
			const file = path.join(dir, `${fileBase}.png`);
			const buf = await page.screenshot({ fullPage: true });
			if (buf && Buffer.isBuffer(buf)) {
				fs.writeFileSync(file, buf);
			}
			await b.close();
			return { success: true, attempts, pageLoadMs, screenshotPath: file, meta: { browser, routePath } };
		} catch (err) {
			lastError = err;
			if (b) {
				try { await b.close(); } catch {}
			}
			if (attempts > retries) {
				break;
			}
			const backoffMs = Math.min(2000 * attempts, 8000);
			await new Promise(res => setTimeout(res, backoffMs));
		}
	}

	return { success: false, attempts, pageLoadMs: now() - startAll, meta: { error: String(lastError), browser } };
}

const runner = { runToMlRoute };
export default runner;
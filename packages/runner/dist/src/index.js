import puppeteer from 'puppeteer';
import firefox from 'puppeteer-firefox';
async function launchBrowser(browser, headless) {
    if (browser === 'firefox') {
        return await firefox.launch({ headless });
    }
    return await puppeteer.launch({ headless });
}
async function ensurePage(browser, viewport) {
    const page = await browser.newPage();
    if (viewport) {
        await page.setViewport(viewport);
    }
    return page;
}
function delay(ms) { return new Promise(res => setTimeout(res, ms)); }
function now() { return Date.now(); }
export async function runToMlRoute(options) {
    const { url, routePath = '/ml', browser, headless = true, viewport = { width: 1366, height: 768 }, timeoutMs = 30000, retries = 2, screenshotDir = 'screenshots' } = options;
    let attempts = 0;
    let lastError = undefined;
    const startAll = now();
    while (attempts <= retries) {
        attempts++;
        let b = null;
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
        }
        catch (err) {
            lastError = err;
            if (b) {
                try {
                    await b.close();
                }
                catch { }
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
export default { runToMlRoute };

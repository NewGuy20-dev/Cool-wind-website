import { z } from 'zod';
export const RunnerConfigSchema = z.object({
    baseUrl: z.string().url(),
    routePath: z.string().default('/ml'),
    browser: z.enum(['chrome', 'firefox']).default('chrome'),
    headless: z.boolean().default(true),
    timeoutMs: z.number().int().positive().default(30000),
    retries: z.number().int().min(0).max(5).default(2),
    viewport: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }).default({ width: 1366, height: 768 }),
    screenshotDir: z.string().default('screenshots'),
    env: z.enum(['dev', 'staging', 'prod']).default('dev')
});
export function loadConfigFromEnv() {
    const raw = {
        baseUrl: process.env.BASE_URL,
        routePath: process.env.ROUTE_PATH,
        browser: process.env.BROWSER,
        headless: process.env.HEADLESS ? process.env.HEADLESS === 'true' : undefined,
        timeoutMs: process.env.TIMEOUT_MS ? Number(process.env.TIMEOUT_MS) : undefined,
        retries: process.env.RETRIES ? Number(process.env.RETRIES) : undefined,
        viewport: process.env.VIEWPORT_WIDTH && process.env.VIEWPORT_HEIGHT ? { width: Number(process.env.VIEWPORT_WIDTH), height: Number(process.env.VIEWPORT_HEIGHT) } : undefined,
        screenshotDir: process.env.SCREENSHOT_DIR,
        env: process.env.NODE_ENV ?? 'dev',
    };
    return RunnerConfigSchema.parse(raw);
}
export default { RunnerConfigSchema, loadConfigFromEnv };

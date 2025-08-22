#!/usr/bin/env node
import { runToMlRoute } from '@logo-suite/runner';
import { generateJsonReport } from '@logo-suite/reporting';
import { loadConfigFromEnv } from '@logo-suite/config';

async function main() {
	const cfg = loadConfigFromEnv();
	const result = await runToMlRoute({
		url: cfg.baseUrl,
		routePath: cfg.routePath,
		browser: cfg.browser,
		headless: cfg.headless,
		viewport: cfg.viewport,
		timeoutMs: cfg.timeoutMs,
		retries: cfg.retries,
		screenshotDir: cfg.screenshotDir,
	});
	const report = generateJsonReport({
		pageLoadMs: result.pageLoadMs,
		detectionMs: 0,
		screenshotPath: result.screenshotPath,
		results: [],
		meta: result.meta,
	});
	console.log(report);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
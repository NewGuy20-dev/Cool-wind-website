import fs from 'fs';

export interface DetectionResult {
	algorithm: string;
	confidence: number;
	coordinates?: { x: number; y: number; width: number; height: number };
	colorDelta?: number;
	severity?: 'critical' | 'warning' | 'info';
	failureReason?: string;
	roi?: string;
	variation?: string;
}

export interface ReportInput {
	pageLoadMs: number;
	detectionMs: number;
	resourceUsage?: { memoryMB?: number; cpuPct?: number };
	screenshotPath?: string;
	results: DetectionResult[];
	meta?: Record<string, unknown>;
}

export function generateJsonReport(input: ReportInput): string {
	const { pageLoadMs, detectionMs, resourceUsage, screenshotPath, results, meta } = input;
	let screenshotBase64: string | undefined;
	if (screenshotPath && fs.existsSync(screenshotPath)) {
		const buf = fs.readFileSync(screenshotPath);
		screenshotBase64 = buf.toString('base64');
	}
	const report = {
		generatedAt: new Date().toISOString(),
		metrics: { pageLoadMs, detectionMs, resourceUsage },
		results,
		screenshotBase64,
		meta
	};
	return JSON.stringify(report, null, 2);
}

const reporting = { generateJsonReport };
export default reporting;
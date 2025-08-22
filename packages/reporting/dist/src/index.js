import fs from 'fs';
export function generateJsonReport(input) {
    const { pageLoadMs, detectionMs, resourceUsage, screenshotPath, results, meta } = input;
    let screenshotBase64;
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
export default { generateJsonReport };

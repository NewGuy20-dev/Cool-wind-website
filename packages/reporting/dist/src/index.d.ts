export interface DetectionResult {
    algorithm: string;
    confidence: number;
    coordinates?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    colorDelta?: number;
    severity?: 'critical' | 'warning' | 'info';
    failureReason?: string;
    roi?: string;
    variation?: string;
}
export interface ReportInput {
    pageLoadMs: number;
    detectionMs: number;
    resourceUsage?: {
        memoryMB?: number;
        cpuPct?: number;
    };
    screenshotPath?: string;
    results: DetectionResult[];
    meta?: Record<string, unknown>;
}
export declare function generateJsonReport(input: ReportInput): string;
declare const reporting: {
    generateJsonReport: typeof generateJsonReport;
};
export default reporting;

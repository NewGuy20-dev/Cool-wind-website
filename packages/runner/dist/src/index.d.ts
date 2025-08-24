export type BrowserType = 'chrome' | 'firefox';
export interface RunOptions {
    url: string;
    routePath?: string;
    browser: BrowserType;
    headless?: boolean;
    viewport?: {
        width: number;
        height: number;
    };
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
export declare function runToMlRoute(options: RunOptions): Promise<RunResult>;
declare const _default: {
    runToMlRoute: typeof runToMlRoute;
};
export default _default;

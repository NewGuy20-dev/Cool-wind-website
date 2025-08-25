import { z } from 'zod';
export declare const RunnerConfigSchema: z.ZodObject<{
    baseUrl: z.ZodString;
    routePath: z.ZodDefault<z.ZodString>;
    browser: z.ZodDefault<z.ZodEnum<{
        chrome: "chrome";
        firefox: "firefox";
    }>>;
    headless: z.ZodDefault<z.ZodBoolean>;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
    retries: z.ZodDefault<z.ZodNumber>;
    viewport: z.ZodDefault<z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.core.$strip>>;
    screenshotDir: z.ZodDefault<z.ZodString>;
    env: z.ZodDefault<z.ZodEnum<{
        dev: "dev";
        staging: "staging";
        prod: "prod";
    }>>;
}, z.core.$strip>;
export type RunnerConfig = z.infer<typeof RunnerConfigSchema>;
export declare function loadConfigFromEnv(): RunnerConfig;
declare const config: {
    RunnerConfigSchema: z.ZodObject<{
        baseUrl: z.ZodString;
        routePath: z.ZodDefault<z.ZodString>;
        browser: z.ZodDefault<z.ZodEnum<{
            chrome: "chrome";
            firefox: "firefox";
        }>>;
        headless: z.ZodDefault<z.ZodBoolean>;
        timeoutMs: z.ZodDefault<z.ZodNumber>;
        retries: z.ZodDefault<z.ZodNumber>;
        viewport: z.ZodDefault<z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strip>>;
        screenshotDir: z.ZodDefault<z.ZodString>;
        env: z.ZodDefault<z.ZodEnum<{
            dev: "dev";
            staging: "staging";
            prod: "prod";
        }>>;
    }, z.core.$strip>;
    loadConfigFromEnv: typeof loadConfigFromEnv;
};
export default config;

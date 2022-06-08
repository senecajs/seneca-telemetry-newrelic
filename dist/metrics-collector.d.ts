import { BaseMetricsResponse } from "./types";
export declare function MetricsCollector(metricApiKey: string): {
    metric_count_handler: (this: any, msg: any) => Promise<BaseMetricsResponse>;
    metric_gauge_handler: (this: any, msg: any) => Promise<BaseMetricsResponse>;
    metric_summary_handler: (this: any, msg: any) => Promise<BaseMetricsResponse>;
};

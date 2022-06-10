import { BaseMetricsResponse } from "./types";
export declare function EventsCollector(eventsApiKey: string): {
    event_handler: (this: any, msg: any) => Promise<BaseMetricsResponse>;
};

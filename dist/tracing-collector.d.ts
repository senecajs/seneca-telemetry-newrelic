import { SpanClient } from "@newrelic/telemetry-sdk/dist/src/telemetry/spans";
import { Spec, TelemetrySpecMetadata } from "./types";
export declare class TracingCollector {
    seneca: any;
    serviceName: string;
    specList: TelemetrySpecMetadata[];
    spanClient: SpanClient;
    constructor(seneca: any, apiKey: string, serviceName: string);
    extractFullMessage(spec: any): string | null;
    _extractFromSpec(spec: Spec, event: 'outward' | 'inward'): TelemetrySpecMetadata;
    _updateSpecList(specMetadata: TelemetrySpecMetadata): Promise<void>;
    _clearQueue(): Promise<unknown>;
    dispatch(spec: Spec, event: 'outward' | 'inward'): void;
    sendTracing(spec: TelemetrySpecMetadata): Promise<string | void | boolean>;
}

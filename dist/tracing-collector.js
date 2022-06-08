"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracingCollector = void 0;
const spans_1 = require("@newrelic/telemetry-sdk/dist/src/telemetry/spans");
const ERROR_FAIL_TO_EXTRACT_JSON = "Error: Invalid JSON parsing;";
class TracingCollector {
    constructor(seneca, apiKey, serviceName) {
        this.specList = [];
        this.serviceName = serviceName;
        this.spanClient = new spans_1.SpanClient({
            apiKey,
        });
        this.seneca = seneca;
    }
    extractFullMessage(spec) {
        try {
            let fullMessage = null;
            if (spec && spec.data && spec.data.msg) {
                fullMessage = JSON.stringify(spec.data.msg);
            }
            return fullMessage;
        }
        catch (error) {
            return ERROR_FAIL_TO_EXTRACT_JSON;
        }
    }
    ;
    _extractFromSpec(spec, event) {
        const metadata = {
            id: spec.data.meta.id,
            tx_id: spec.data.meta.tx,
            mi_id: spec.data.meta.mi,
            fullMessage: this.extractFullMessage(spec)
        };
        if (spec.ctx.actdef) {
            metadata.plugin_name = spec.ctx.actdef.plugin_fullname;
            metadata.pattern = spec.ctx.actdef.pattern;
        }
        if (event === 'outward') {
            metadata.duration = spec.ctx.duration;
            metadata.endTime = spec.data.meta.end;
            metadata.res = spec.data.res;
            metadata.manualEndTime = Date.now();
        }
        if (event === 'inward' && !metadata.startTime) {
            metadata.startTime = spec.data.meta.start;
            metadata.manualStartTime = Date.now();
        }
        return metadata;
    }
    ;
    async _updateSpecList(specMetadata) {
        const spec = this.specList.find((s) => s.mi_id === specMetadata.mi_id);
        if (spec) {
            Object.assign(spec, specMetadata);
            if (spec.manualEndTime && spec.manualStartTime && !spec.dispatched) {
                try {
                    await this.sendTracing(spec);
                    spec.dispatched = true;
                    this._clearQueue();
                }
                catch (error) {
                    this.seneca.log.error(error);
                }
            }
        }
        else {
            this.specList.push(specMetadata);
        }
    }
    ;
    _clearQueue() {
        return new Promise((resolve, reject) => {
            this.specList = this.specList.filter((s) => !s.dispatched);
            resolve(true);
        });
    }
    dispatch(spec, event) {
        const telemetrySpecMetadata = this._extractFromSpec(spec, event);
        this._updateSpecList(telemetrySpecMetadata);
    }
    sendTracing(spec) {
        return new Promise((resolve, reject) => {
            const spanBatch = new spans_1.SpanBatch();
            const span = new spans_1.Span(spec.mi_id, spec.tx_id, spec.manualStartTime, `${spec.plugin_name} ~ ${spec.pattern}`, spec.tx_id, this.serviceName, spec.manualEndTime - spec.manualStartTime, {
                plugin_name: spec.plugin_name,
                pattern: spec.pattern,
                fullMessage: spec.fullMessage,
            });
            spanBatch.addSpan(span);
            this.spanClient.send(spanBatch, (error, res, body) => {
                if (error) {
                    this.seneca.log.error(error);
                }
                resolve(res.statusCode);
            });
        });
    }
}
exports.TracingCollector = TracingCollector;
//# sourceMappingURL=tracing-collector.js.map
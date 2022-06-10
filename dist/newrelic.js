"use strict";
/* Copyright © 2021 Seneca Project Contributors, MIT License. */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const newrelic_1 = __importDefault(require("newrelic"));
const gubu_1 = require("gubu");
const tracing_collector_1 = require("./tracing-collector");
const metrics_collector_1 = require("./metrics-collector");
const events_collector_1 = require("./events-collector");
function addSegment(spec) {
    var _a;
    if ((_a = spec.ctx.actdef) === null || _a === void 0 ? void 0 : _a.func) {
        const { ctx, data } = spec;
        const pattern = ctx.actdef.pattern;
        const origfunc = ctx.actdef.func;
        const meta = data.meta;
        const context = ctx.seneca.context;
        if (ctx.actdef.func.$$newrelic_wrapped$$) {
            return;
        }
        // ensure each action has it's own endSegment
        context.newrelic = context.newrelic || {};
        let endSegmentMap = (context.newrelic.endSegmentMap = context.newrelic.endSegmentMap || {});
        ctx.actdef.func = function (...args) {
            const instance = this;
            newrelic_1.default.startSegment(pattern + '~' + origfunc.name, true, function handler(endSegmentHandler) {
                endSegmentMap[meta.mi] = (endSegmentMap[meta.mi] || {});
                endSegmentMap[meta.mi].endSegmentHandler = endSegmentHandler;
                return origfunc.call(instance, ...args);
            }, function endSegmentHandler() { });
            ctx.actdef.func.$$newrelic_wrapped$$ = true;
        };
        Object.defineProperty(ctx.actdef.func, 'name', { value: 'newrelic_' + origfunc.name });
    }
}
function endSegment(spec) {
    var _a;
    const meta = spec.data.meta;
    const context = spec.ctx.seneca.context;
    const endSegmentMap = (_a = context.newrelic) === null || _a === void 0 ? void 0 : _a.endSegmentMap;
    if (endSegmentMap && endSegmentMap[meta.mi]) {
        const endSegmentHandler = endSegmentMap[meta.mi].endSegmentHandler;
        if (endSegmentHandler) {
            delete endSegmentMap[meta.mi];
            endSegmentHandler();
        }
    }
}
function preload(opts) {
    var _a, _b;
    const seneca = this;
    const { options } = opts;
    const isPluginEnabled = options && options.enabled;
    if (!isPluginEnabled) {
        return;
    }
    const segmentIsEnabled = options.segment && options.segment.enabled;
    const tracingIsEnabled = options.tracing && options.tracing.enabled;
    const metricsIsEnabled = options.metrics && options.metrics.enabled;
    const eventsIsEnabled = options.events && options.events.enabled;
    let tracingCollector = null;
    if (tracingIsEnabled && options.tracing) {
        const { accountApiKey, serviceName } = options.tracing;
        tracingCollector = new tracing_collector_1.TracingCollector(seneca, accountApiKey, serviceName);
    }
    seneca.order.inward.add((spec) => {
        if (segmentIsEnabled) {
            addSegment(spec);
        }
        if (tracingCollector) {
            tracingCollector.dispatch(spec, 'inward');
        }
    });
    seneca.order.outward.add((spec) => {
        if (segmentIsEnabled) {
            endSegment(spec);
        }
        if (tracingCollector) {
            tracingCollector.dispatch(spec, 'outward');
        }
    });
    if (metricsIsEnabled) {
        if (!((_a = options.metrics) === null || _a === void 0 ? void 0 : _a.accountApiKey)) {
            throw new Error("Please provide accountApiKey parameter to Metrics API");
        }
        this.metrics_api_key = options.metrics.accountApiKey;
    }
    if (eventsIsEnabled) {
        if (!((_b = options.events) === null || _b === void 0 ? void 0 : _b.accountApiKey)) {
            throw new Error("Please provide accountApiKey parameter to Events API");
        }
        this.events_api_key = options.events.accountApiKey;
    }
}
function newrelic(options) {
    const isPluginEnabled = options && options.enabled;
    if (!isPluginEnabled) {
        return;
    }
    const seneca = this;
    seneca.message('plugin:newrelic,get:info', get_info);
    if (seneca.metrics_api_key) {
        const { metric_count_handler, metric_summary_handler, metric_gauge_handler } = (0, metrics_collector_1.MetricsCollector)(seneca.metrics_api_key);
        seneca
            .message({
            plugin: 'newrelic',
            api: 'metric',
            type: 'count',
            value: Number,
            name: String,
            attributes: (0, gubu_1.Skip)({}),
        }, metric_count_handler)
            .message({
            plugin: 'newrelic',
            api: 'metric',
            type: 'gauge',
            value: Number,
            name: String,
            attributes: (0, gubu_1.Skip)({}),
        }, metric_gauge_handler)
            .message({
            plugin: 'newrelic',
            api: 'metric',
            type: 'summary',
            value: (0, gubu_1.Some)({
                count: (0, gubu_1.Skip)(Number),
                sum: (0, gubu_1.Skip)(Number),
                min: (0, gubu_1.Skip)(Number),
                max: (0, gubu_1.Skip)(Number),
            }),
            name: String,
            attributes: (0, gubu_1.Skip)({})
        }, metric_summary_handler);
    }
    if (seneca.events_api_key) {
        const { event_handler } = (0, events_collector_1.EventsCollector)(seneca.events_api_key);
        seneca
            .message({
            plugin: 'newrelic',
            api: 'event',
            eventType: String,
            attributes: (0, gubu_1.Some)({}),
        }, event_handler);
    }
    async function get_info(_msg) {
        return {
            ok: true,
            name: 'newrelic',
            details: {
                sdk: 'newrelic'
            }
        };
    }
    return {
        exports: {
            native: () => ({})
        }
    };
}
// Default options.
const defaults = {
    enabled: false,
    tracing: {
        enabled: false,
        accountApiKey: '',
        serviceName: '',
    },
    events: {
        enabled: false,
        accountApiKey: '',
    },
    metrics: {
        accountApiKey: '',
        enabled: false,
    },
    segment: {
        enabled: false,
    },
    // TODO: Enable debug logging
    debug: false
};
Object.assign(newrelic, { defaults, preload });
exports.default = newrelic;
if ('undefined' !== typeof (module)) {
    module.exports = newrelic;
}
//# sourceMappingURL=newrelic.js.map
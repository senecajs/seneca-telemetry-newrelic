"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
const metrics_1 = require("@newrelic/telemetry-sdk/dist/src/telemetry/metrics");
function MetricsCollector(metricApiKey) {
    const metricsClient = new metrics_1.MetricClient({
        apiKey: metricApiKey,
    });
    async function metric_count_handler(msg) {
        const { name, value, attributes } = msg;
        const countMetrics = new metrics_1.CountMetric(name, value, attributes || {});
        const batch = _metricBatchBuilder(countMetrics);
        return _sendBatch(batch);
    }
    async function metric_gauge_handler(msg) {
        const { name, value, attributes } = msg;
        const gaugeMetric = new metrics_1.GaugeMetric(name, value, attributes || {});
        const batch = _metricBatchBuilder(gaugeMetric);
        return _sendBatch(batch);
    }
    async function metric_summary_handler(msg) {
        const { name, value, attributes } = msg;
        const { count, sum, min, max } = value;
        const summaryData = {
            count: count || 0,
            sum: sum || 0,
            min: min || Infinity,
            max: max || -Infinity,
        };
        const summaryMetrics = new metrics_1.SummaryMetric(name, summaryData, attributes || {});
        const batch = _metricBatchBuilder(summaryMetrics);
        return _sendBatch(batch);
    }
    const _metricBatchBuilder = (metric) => {
        const batch = new metrics_1.MetricBatch({}, Date.now(), 1000);
        batch.addMetric(metric);
        return batch;
    };
    const _sendBatch = (batch) => {
        return new Promise((resolve, reject) => {
            metricsClient.send(batch, (err, res, body) => {
                const response = {
                    err: null,
                    statusCode: null,
                    body: null,
                };
                if (err) {
                    response.err = err;
                    return reject(response);
                }
                response.statusCode = res.statusCode;
                response.body = body;
                return resolve(response);
            });
        });
    };
    return { metric_count_handler, metric_gauge_handler, metric_summary_handler };
}
exports.MetricsCollector = MetricsCollector;
//# sourceMappingURL=metrics-collector.js.map
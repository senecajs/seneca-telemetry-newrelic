"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsCollector = void 0;
const events_1 = require("@newrelic/telemetry-sdk/dist/src/telemetry/events");
function EventsCollector(eventsApiKey) {
    const eventsClient = new events_1.EventClient({
        apiKey: eventsApiKey,
    });
    function event_handler(msg) {
        const { eventType, attributes, timestamp } = msg;
        const event = new events_1.Event(eventType, attributes || {}, timestamp || Date.now());
        const eventBatch = new events_1.EventBatch({}, [event]);
        return new Promise((resolve, reject) => {
            eventsClient.send(eventBatch, (err, res, body) => {
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
    }
    return { event_handler };
}
exports.EventsCollector = EventsCollector;
//# sourceMappingURL=events-collector.js.map
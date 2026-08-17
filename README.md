![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) plugin

# @seneca/telemetry-newrelic

[![npm version](https://img.shields.io/npm/v/@seneca/telemetry-newrelic.svg)](https://npmjs.com/package/@seneca/telemetry-newrelic)
[![build](https://github.com/senecajs/seneca-telemetry-newrelic/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-telemetry-newrelic/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-telemetry-newrelic/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-telemetry-newrelic?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-telemetry-newrelic/badge.svg)](https://snyk.io/test/github/senecajs/seneca-telemetry-newrelic)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/21069/branches/594597/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=21069&bid=594597)
[![Maintainability](https://api.codeclimate.com/v1/badges/8f582b6e8160841b076f/maintainability)](https://codeclimate.com/github/senecajs/seneca-telemetry-newrelic/maintainability)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

Capture NewRelic telemetry for Seneca actions.

## Install

```sh
npm install @seneca/telemetry-newrelic
```

**Dependencies:**

- Install [Newrelic infrastructure agent](https://docs.newrelic.com/docs/infrastructure/install-infrastructure-agent/get-started/install-infrastructure-agent/)

## Quick Example

```js
const Seneca = require('seneca');
const newrelicPlugin = require('seneca-telemetry-newrelic');

const SECRET_NEWRELIC_API_KEY = "SECRET_NEWRELIC_API_KEY";
const MY_SERVICE_NAME = "MY_SERVICE_NAME";

const senecaInstance = Seneca()
  .use('promisify')
  .use(newrelicPlugin, {
    // Enable Tracing
    tracing: {
      enabled: true,
      accountApiKey: SECRET_NEWRELIC_API_KEY,
      serviceName: MY_SERVICE_NAME,
    },
    // Enable Segments
    segment: {
      enabled: true,
    },
    // Enable Metrics
    metrics: {
      enabled: true,
      accountApiKey: SECRET_NEWRELIC_API_KEY,
    },
    // Enable Events
    events: {
      enabled: true,
      accountApiKey: SECRET_NEWRELIC_API_KEY,
    },
  });
```

## More Examples

See [test/](test/) for more usage examples.

## Motivation

Plugin for integrating [New Relic](https://newrelic.com/) with Seneca.js for telemetry and observability.

## Support

If you're using this module and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-telemetry-newrelic/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter](https://gitter.im/senecajs/seneca)

## API

### Events

Send your own custom [event data](https://docs.newrelic.com/docs/data-apis/understand-data/new-relic-data-types/#events-new-relic).

Events API should be used to track specific/edge cases. In most cases, try to use Metrics.

```js
// The base pattern is: "plugin:newrelic,api:event"
// All res objects follow the same pattern: { err?: Error, statusCode?: number, body? }

seneca.act('plugin:newrelic,api:event,somethingHappened,attributes:{isOK:false,error:"System Crash - CODE 784"}', (err, res) => {
  // err is null
  // handle res here (Check for errors, log data, et cetera)
});
```

### Metrics

Send your own custom [dimensional metrics](https://docs.newrelic.com/docs/data-apis/understand-data/new-relic-data-types/#dimensional-metrics) to New Relic.

The SDK supports three types of Metrics: `count`, `gauge`, `summary`. Read about metric types [here](https://docs.newrelic.com/docs/data-apis/understand-data/metric-data/metric-data-type).

```js
// The base pattern is: "plugin:newrelic,api:metric"
// You can also pass a custom object in the attributes field
// All res objects follow the same pattern: { err?: Error, statusCode?: number, body? }
```

Gauge example:

```js
// value must be typeof number
seneca.act("plugin:newrelic,api:metric,type:gauge,value:2,name:custom.seneca.counter,attributes:{'user.name': 'Vitor', age: 26}", (err, res) => {
  // handle res here
})
```

Summary example:

```js
// value must be of typeof { count?: number, sum?: number, min?: number, max?: number }
seneca.act('plugin:newrelic,api:metric,type:summary,name:sumOfSomething,value:{sum: 1}');
```

Count example:

```js
// value must be typeof number
seneca.act('plugin:newrelic,api:metric,type:count,name:custom.counter,value:10');
```

### Tracing

After enabling it, Seneca will start sending [distributed tracing data](https://docs.newrelic.com/docs/data-apis/understand-data/new-relic-data-types/#trace-data) to New Relic.

When an action is dispatched, Seneca traces it until it finishes, then sends the aggregated data to New Relic. In the New Relic UI you will see the performance of your Seneca actions.

### Segment

TODO

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

### Running tests

```sh
npm run test
```

## Background

Integrates with [New Relic](https://newrelic.com/) for observability of Seneca microservices.

![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) plugin

# @seneca/telemetry-newrelic

[![npm version](https://img.shields.io/npm/v/@seneca/telemetry-newrelic.svg)](https://npmjs.com/package/@seneca/telemetry-newrelic)
[![build](https://github.com/senecajs/seneca-telemetry-newrelic/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-telemetry-newrelic/actions/workflows/build.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-telemetry-newrelic/badge.svg)](https://snyk.io/test/github/senecajs/seneca-telemetry-newrelic)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-telemetry-newrelic/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-telemetry-newrelic?branch=main)
[![Maintainability](https://api.codeclimate.com/v1/badges/8f582b6e8160841b076f/maintainability)](https://codeclimate.com/github/senecajs/seneca-telemetry-newrelic/maintainability)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

```sh
npm install @seneca/telemetry-newrelic
```

## Quick Example

```js
require('seneca')()
  .use('@seneca/telemetry-newrelic')
```

## More Examples

See [test/](test/) for more usage examples.

## Motivation

New Relic telemetry integration for Seneca microservices.

## Support

If you're using this module and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-telemetry-newrelic/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter](https://gitter.im/senecajs/seneca)

## API

### Events

Send your own custom [event data](#https://docs.newrelic.com/docs/data-apis/understand-data/new-relic-data-types/#events-new-relic).

Events API should be used to track specific/edge cases, in most of cases, try to use Metrics.

#### Usage

```js

// The base pattern is: "plugin:newrelic,api:event"

// All res objects follow the same pattern: { err?: Error, statusCode?: number, body?;

// You can fulfill the attributes object, and then use it inside Newrelic to query and aggregate your data.

seneca.act('plugin:newrelic,api:event,somethingHappened,attributes:{isOK:false,error:"System Crash - CODE 784"}', (err, res) => {

// err is null

// handle res here (Check for errors, log data, et cetera)

});

```

### Metrics

Send your your own custom [dimensional metrics](#https://docs.newrelic.com/docs/data-apis/understand-data/new-relic-data-types/#dimensional-metrics) to Newrelic.

The SDK currently supports three types of Metrics: count, gauge, summary. You can read about metrics types [here](#https://docs.newrelic.com/docs/data-apis/understand-data/metric-data/metric-data-type).

#### Usage

```js

// The base pattern is: "plugin:newrelic,api:metric"

// You can also pass a custom object in the attributes field;

// All res objects follow the same pattern: { err?: Error, statusCode?: number, body?;

```

Gauge example:

```js

// value must be typeof number

seneca.act("plugin:newrelic,api:metric,type:gauge,value:2,name:custom.seneca.counter,attributes:{'user.name': 'Vitor', age: 26}", (err, res) => {

// err is null

// handle res here (Check for errors, log data, et cetera)

})

```

Summary Example:

```js

// value must be of typeof { count?: number, sum?: number, min?: number, max?: number}

seneca.act('plugin:newrelic,api:metric,type:summary,name:sumOfSomething,value:{sum: 1}');

```

Count Example:

```js

// value must be typeof number

seneca.act('plugin:newrelic,api:metric,type:count,name:custom.counter,value:10');

```

### Tracing

After enabling it, Seneca will start sending [distributed tracing data](#https://docs.newrelic.com/docs/data-apis/understand-data/new-relic-data-types/#trace-data) to Newrelic.

In the context of Seneca, in your application when a action is dispatched, Seneca will trace it down until it finishes/arrives, then you send this distributed aggregated data to Newrelic.

In the Newrelic UI you will be able to see the performance of your seneca actions.

### Segment

#### TODO

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

### Running tests

```sh
npm run test
```

## Background

Integrates with [New Relic](https://newrelic.com/) for observability.

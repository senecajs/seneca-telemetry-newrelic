/* Copyright © 2021 Seneca Project Contributors, MIT License. */


import NewRelic from 'newrelic';
import { Skip, Some } from 'gubu';

import { TracingCollector } from './tracing-collector';
import { MetricsCollector } from './metrics-collector';
import { EventsCollector } from './events-collector';

import { NewRelicOptions, Nullable, Spec } from './types';

function addSegment(spec: Spec) {
  if (spec.ctx.actdef?.func) {
    const { ctx, data } = spec
    const pattern = ctx.actdef.pattern
    const origfunc = ctx.actdef.func
    const meta = data.meta
    const context = ctx.seneca.context
    
    if(ctx.actdef.func.$$newrelic_wrapped$$) {
      return
    }

    // ensure each action has it's own endSegment
    context.newrelic = context.newrelic || {}
    let endSegmentMap =
      (context.newrelic.endSegmentMap = context.newrelic.endSegmentMap || {})

    ctx.actdef.func = function(this: any, ...args: any) {
      const instance = this
      NewRelic.startSegment(
        pattern + '~' + origfunc.name,
        true,
        function handler(endSegmentHandler: any) {
          endSegmentMap[meta.mi] = (endSegmentMap[meta.mi] || {})
          endSegmentMap[meta.mi].endSegmentHandler = endSegmentHandler
          return origfunc.call(instance, ...args)
        },
        function endSegmentHandler() { }
      )

      ctx.actdef.func.$$newrelic_wrapped$$ = true;
    }

    Object.defineProperty(
      ctx.actdef.func, 'name', { value: 'newrelic_' + origfunc.name })
  }
}

function endSegment(spec: Spec) {
  const meta = spec.data.meta
  const context = spec.ctx.seneca.context
  const endSegmentMap = context.newrelic?.endSegmentMap
  if (endSegmentMap && endSegmentMap[meta.mi]) {
    const endSegmentHandler = endSegmentMap[meta.mi].endSegmentHandler
    if (endSegmentHandler) {
      delete endSegmentMap[meta.mi]
      endSegmentHandler()
    }
  }
}

function preload(this: any, opts: any) {
  const seneca = this;
  const { options }: { options: NewRelicOptions } = opts;
  const isPluginEnabled = options && options.enabled

  if(!isPluginEnabled) {
    return
  }

  const segmentIsEnabled = options.segment && options.segment.enabled;
  const tracingIsEnabled = options.tracing && options.tracing.enabled;
  const metricsIsEnabled = options.metrics && options.metrics.enabled;
  const eventsIsEnabled = options.events && options.events.enabled;
  
  let tracingCollector: Nullable<TracingCollector> = null;
  if (tracingIsEnabled && options.tracing) {
    const { accountApiKey, serviceName } = options.tracing;
    tracingCollector = new TracingCollector(
      seneca, accountApiKey, serviceName
    );
  }

  seneca.order.inward.add((spec: Spec) => {
    if (segmentIsEnabled) {
      addSegment(spec);
    }
    if (tracingCollector) {
      tracingCollector.dispatch(spec, 'inward');
    }
  })

  seneca.order.outward.add((spec: Spec) => {
    if (segmentIsEnabled) {
      endSegment(spec);
    }
    if (tracingCollector) {
      tracingCollector.dispatch(spec, 'outward');
    }
  })

  if (metricsIsEnabled) {
    if (!options.metrics?.accountApiKey) {
      throw new Error("Please provide accountApiKey parameter to Metrics API");
    }
    this.metrics_api_key = options.metrics.accountApiKey;
  }

  if (eventsIsEnabled) {
    if (!options.events?.accountApiKey) {
      throw new Error("Please provide accountApiKey parameter to Events API");
    }
    this.events_api_key = options.events.accountApiKey;
  }
}

function newrelic(this: any, options: NewRelicOptions) {
    const isPluginEnabled = options && options.enabled

    if(!isPluginEnabled) {
      return
    }

    const seneca: any = this

    seneca.message('plugin:newrelic,get:info', get_info)

    if (seneca.metrics_api_key) {
      const { metric_count_handler, metric_summary_handler, metric_gauge_handler} = MetricsCollector(seneca.metrics_api_key);
      seneca
        .message({
          plugin: 'newrelic',
          api: 'metric',
          type: 'count',
          value: Number,
          name: String,
          attributes: Skip({}),
        }, metric_count_handler)
        .message({
          plugin: 'newrelic',
          api: 'metric',
          type: 'gauge',
          value: Number,
          name: String,
          attributes: Skip({}),
        }, metric_gauge_handler)
        .message({
          plugin: 'newrelic',
          api: 'metric',
          type: 'summary',
          value: Some({
            count: Skip(Number),
            sum: Skip(Number),
            min: Skip(Number),
            max: Skip(Number),
          }),
          name: String,
          attributes: Skip({})
        }, metric_summary_handler);
    }
    if (seneca.events_api_key) {
      const { event_handler } = EventsCollector(seneca.events_api_key);
      seneca
        .message({
          plugin: 'newrelic',
          api: 'event',
          eventType: String,
          attributes: Some({}),
        }, event_handler)
    }

    async function get_info(this: any, _msg: any) {
      return {
        ok: true,
        name: 'newrelic',
        details: {
          sdk: 'newrelic'
        }
      }
    }

    return {
      exports: {
        native: () => ({})
      }
    }
}

// Default options.
const defaults: NewRelicOptions = {
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
}

Object.assign(newrelic, {defaults, preload})

export default newrelic

if ('undefined' !== typeof (module)) {
    module.exports = newrelic
}

import type { Span } from 'dd-trace';

import tracer from 'dd-trace';

const Tracer = {
  async traceFunction({
    name,
    retainTrace,
    options = { tags: {}, resource: '' },
    promise,
  }: {
    name: string;
    promise: (span?: Span, done?: (error?: Error) => void) => unknown;
    retainTrace?: boolean;
    options?: {
      tags?: { [key: string]: string | boolean | number };
      resource?: string;
    };
  }) {
    if (retainTrace) {
      if (options.tags) options.tags.retain = true;
      else options.tags = { retain: true };
    }

    return tracer.trace(name, options, promise);
  },

  setSpanTag(
    key: string,
    value: {
      key: string;
      value: unknown;
    }
  ) {
    const span = tracer.scope().active();

    if (span) {
      span.setTag(key, value);
    }
  },

  getTraceId() {
    const span = tracer.scope().active();
    if (span) return span.context().toTraceId();

    return undefined;
  },
};

export default Tracer;

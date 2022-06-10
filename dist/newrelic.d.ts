import { NewRelicOptions } from './types';
declare function newrelic(this: any, options: NewRelicOptions): {
    exports: {
        native: () => {};
    };
} | undefined;
export default newrelic;

import type { Validator } from './schema';

export interface ListenOptions {
    /**
     * Server port to listen
     */
    port?: number | string;

    /**
     * Server hostname to listen
     *
     * @example `localhost`, `0.0.0.0`
     *
     */

    hostname?: string;

    /**
     * Development flag.
     *
     * @default NODE_ENV enviroment variable value
     */
    development?: boolean;

    /**
     * Global schema validator that will be used in every route
     */
    schemaValidator?: Validator;
}

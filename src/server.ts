import { serve } from 'bun';

import type { BunRequest } from 'bun';

import { HttpError } from './errors/HttpError';

import type {
    Route,
    RouteOptions,
    RouteRequest,
    RouteResponse,
    Headers,
    HttpMethod,
} from './types/route';

import type { Schema, Validate } from './types/schema';

import type { ListenOptions } from './types/server';

type PreparedRoute = Partial<Record<HttpMethod, WrappedRouteCallback>>;

export type WrappedRouteCallback = (request: BunRequest) => Promise<Response>;

/**
 * Used straight as Bun.serve `routes` object.
 */
type PreparedRoutes = Record<RouteOptions['url'], PreparedRoute>;

export type Routes = Map<RouteOptions['url'], Route>;

/**
 * An internal Map with routes of app. Do not use it in user code to prevent undefined errors
 */
export const _routes: Routes = new Map();

const handleBody = (
    request: BunRequest,
    contentType: string,
    schema?: Schema,
    schemaValidator?: Validate
): Promise<unknown> => {
    const contentHandlers = {
        'application/json': (request: BunRequest) => {
            return request
                .json()
                .catch((error) => {
                    throw new HttpError(400, error);
                })
                .then((data) => {
                    if (
                        schema &&
                        schemaValidator &&
                        !schemaValidator(data, schema)
                    ) {
                        throw new HttpError(
                            400,
                            'Request does not match schema'
                        );
                    }
                    return data;
                });
        },

        'text/plain': (request: BunRequest) => {
            return request
                .text()
                .catch((error) => {
                    throw new HttpError(400, error);
                })
                .then((data) => {
                    if (
                        schema &&
                        schemaValidator &&
                        !schemaValidator(data, schema)
                    ) {
                        throw new HttpError(
                            400,
                            'Request does not match schema'
                        );
                    }
                    return data;
                });
        },
    };

    return contentType in contentHandlers
        ? contentHandlers[contentType as keyof typeof contentHandlers](request)
        : Promise.reject(new HttpError(415, 'Unsupported media type'));
};

const handleRequest = (
    request: RouteRequest,
    routeOptions: RouteOptions
): Response => {
    let status: number | undefined = undefined;
    let statusText: string | undefined = undefined;

    let responseBody: unknown = null;
    const responseHeaders: Headers = {};

    const routeRequest: RouteRequest = request;
    const routeResponse: RouteResponse = {
        setHeader: (name, value) => {
            responseHeaders[name] = value;
        },
        send: (data, options) => {
            if (typeof data === 'object') {
                responseHeaders['Content-Type'] = 'application/json';
            } else if (typeof data === 'string') {
                responseHeaders['Content-Type'] = 'text/plain';
            }

            responseBody = data;

            status = options?.status;
            statusText = options?.statusText;
        },
    };

    routeOptions.onRequest?.(routeRequest, routeResponse);

    routeOptions.preHandler?.(routeRequest, routeResponse);

    routeOptions.handler(routeRequest, routeResponse);

    return new Response(
        responseBody === null ? null : JSON.stringify(responseBody),
        {
            headers: responseHeaders,
            status,
            statusText,
        }
    );
};

/**
 * Internal `server` function.
 * Creates a function with handler and all route hooks.
 *
 * The created function can be used as a callback for route in Bun.serve `routes` object.
 *
 *
 *
 * @param routeOptions options of route
 * @returns {WrappedRouteCallback} Function that is ready to be used in Bun.serve `routes`
 */
export const wrapRouteCallback = (
    routeOptions: RouteOptions,
    schemaValidator?: Validate
): WrappedRouteCallback => {
    return (request) => {
        const contentType = request.headers.get('Content-Type') ?? 'text/plain';

        return handleBody(request, contentType, '__SCHEMA__', schemaValidator)
            .catch((error) => {
                if (error instanceof HttpError) {
                    return new Response(error.message, {
                        status: error.status,
                    });
                }
            })
            .then((bodyData) => {
                const routeRequest: RouteRequest = Object.create(request);
                routeRequest.body = bodyData;

                return handleRequest(routeRequest, routeOptions);
            });
    };
};

/**
 * Internal `server` function.
 * Prepares a route to be used in Bun.serve `routes` object.
 *
 * @param {Route} route
 *
 * @returns {PreparedRoute} Route object with `GET` or other http method keys with wrapped route callbacks.
 *
 * @example
 * ```typescript
 * prepareRoute({
 *   GET: {
 *     url: '/products',
 *       method: 'GET',
 *       handler: (request, response) => {},
 *   },
 *   POST: {`
 *     url: '/products/:id',
 *       method: 'POST',
 *       handler: (request, response) => {},
 *   },
 * });
 *
 * // Output will be:
 *
 * ({
 *   GET: (request: BunRequest) => {
 *     // ...code
 *     return new Response();
 *   },
 *   POST: (request: BunRequest) => {
 *     // ...code
 *     return new Response();
 *   },
 * })
 * ```
 *
 */
export const prepareRoute = (
    route: Route,
    schemaValidator?: Validate
): PreparedRoute => {
    const preparedRoute: PreparedRoute = {};

    for (const routeMethod of Object.entries(route) as [
        HttpMethod,

        RouteOptions
    ][]) {
        preparedRoute[routeMethod[0]] = wrapRouteCallback(
            routeMethod[1],
            schemaValidator
        );
    }

    return preparedRoute;
};

/**
 * Internal server function.
 * Calls `prepareRoute` for every route of `_routes` Map and returns prepared routes to use in Bun.serve `routes`.
 *
 * @param {Routes} routes Map with routes to prepare.
 *
 * @returns {PreparedRoutes} An object that is used straight in Bun.serve `routes` object.
 */
export const prepareRoutes = (
    routes: Routes,
    schemaValidator?: Validate
): PreparedRoutes => {
    const preparedRoutes: PreparedRoutes = {};
    for (const route of routes) {
        preparedRoutes[route[0]] = prepareRoute(route[1], schemaValidator);
    }

    return preparedRoutes;
};

/**
 * Starts serving http server.
 *
 *
 * @param {ListenOption} options - options
 *
 *
 *
 * @example
 *
 * ```typescript
 * import { listen } from 'crumb-bun';
 *
 * const PORT = proccess.env['PORT'] || 1000;
 *
 * listen(PORT, 'localhost');
 * ```
 */
export const listen = (options: ListenOptions): void => {
    serve({
        port: options.port,
        hostname: options.hostname,
        development: options.development ?? false,

        routes: prepareRoutes(_routes, options?.schemaValidator),
    });
};

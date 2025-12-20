// TODO: add docs

import { serve } from 'bun';

import type { BunRequest } from 'bun';

import type {
    Route,
    RouteOptions,
    RouteRequest,
    RouteResponse,
    Headers,
    HttpMethod,
} from './types/route';

type WrappedRouteCallback = (request: BunRequest) => Promise<Response>;

type PreparedRoute = Partial<Record<HttpMethod, WrappedRouteCallback>>;

type PreparedRoutes = Record<RouteOptions['url'], PreparedRoute>;

export const _routes = new Map<RouteOptions['url'], Route>();

const wrapRouteCallback = (
    routeOptions: RouteOptions
): WrappedRouteCallback => {
    return (request) => {
        let status: number | undefined = undefined;

        let statusText: string | undefined = undefined;

        let responseBody: unknown = null;
        let headers: Headers = {};

        const routeRequest: RouteRequest = request;

        const bodyPromise = request.body?.json() ?? Promise.resolve(undefined);

        return bodyPromise.then((data) => {
            routeRequest.body = data;

            const routeResponse: RouteResponse = {
                setHeader: (name, value) => {
                    headers[name] = value;
                },

                send: (data, options) => {
                    responseBody = data;
                    status = options?.status;
                    statusText = options?.statusText;
                },
            };

            if (typeof responseBody === 'object') {
                headers['Content-Type'] = 'application/json';
            } else {
                headers['Content-Type'] = 'text/plain';
            }

            routeOptions.onRequest?.(routeRequest, routeResponse);

            routeOptions.preHandler?.(routeRequest, routeResponse);

            routeOptions.handler(routeRequest, routeResponse);

            return new Response(JSON.stringify(responseBody), {
                headers,
                status,
                statusText,
            });
        });
    };
};

const prepareRoute = (route: Route): PreparedRoute => {
    const preparedRoute: Partial<PreparedRoute> = {};

    for (const routeMethod of Object.entries(route) as [
        HttpMethod,

        RouteOptions
    ][]) {
        preparedRoute[routeMethod[0]] = wrapRouteCallback(routeMethod[1]);
    }

    return preparedRoute;
};

const prepareRoutes = (): PreparedRoutes => {
    const preparedRoutes: PreparedRoutes = {};

    for (const route of _routes) {
        preparedRoutes[route[0]] = prepareRoute(route[1]);
    }

    return preparedRoutes;
};
export const listen = (port?: number | string, hostname?: string): void => {
    serve({
        port,

        hostname,
        routes: prepareRoutes(),
    });
};

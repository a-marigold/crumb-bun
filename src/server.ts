import { serve } from 'bun';

import type {
    Route,
    RouteRequest,
    RouteResponse,
    Headers,
} from './types/route';

export const _routes = new Map<Route['url'], Route>();

export const listen = (port?: number, hostname?: string): void => {
    serve({
        port,

        hostname,

        fetch: (request) => {
            let body: unknown;
            let headers: Headers = {};
            let status: number = 200;

            const currentRoute = _routes.get(request.url);

            if (!currentRoute) {
                return new Response(undefined, {
                    status: 404,
                    statusText: 'Not Found',
                });
            }

            const routeRequest: RouteRequest = {
                ...request,
            };

            request.json().then((body) => {
                routeRequest.body = body;
            });

            const routeResponse: RouteResponse = {
                setHeader: (name, value) => {
                    headers[name] = value;
                },

                send: (data) => {
                    body = data;
                },
            };

            currentRoute.onRequest?.(routeRequest, routeResponse);

            currentRoute.preHandler?.(routeRequest, routeResponse);

            currentRoute.handler(routeRequest, routeResponse);

            return new Response(JSON.stringify(body), { headers, status });
        },
    });
};

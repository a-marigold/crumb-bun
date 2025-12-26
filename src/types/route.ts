// TODO: add docs

import type { BunRequest } from 'bun';
import type { SchemaData } from './schema';

/**
 * HTTP Method primitive.
 *
 * @example
 * ```typescript
 * const method: HttpMethod = 'GET';
 * ```
 */
export type HttpMethod =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE'
    | 'OPTIONS';

/**
 * HTTP Header struct.
 */
export type Header = {
    name: string;
    value: string;
};
export type Headers = ResponseInit['headers'];

/**
 * Type of route handler `request`
 */
export interface RouteRequest<T extends { body: unknown } = { body: unknown }>
    extends Omit<BunRequest, 'body'> {
    /**
     * Parsed, validated from schema body of reqeust
     */
    handleBody: () => Promise<
        T extends { body: unknown } ? T['body'] : unknown
    >;
}

export interface ResponseOptions {
    status: number;
    statusText?: string;
}

/**
 *
 * Type of route handler `response`
 */
export interface RouteResponse<
    T extends { body: unknown } = { body: unknown }
> {
    setHeader: (name: Header['name'], value: Header['value']) => void;
    send: (data: T['body'], options?: ResponseOptions) => void;
}

export type Route = Partial<Record<HttpMethod, RouteOptions>>;

export type RouteHandler = (
    request: RouteRequest,
    response: RouteResponse
) => void;

export type RouteOptions = {
    url: string;
    method: HttpMethod;

    schema?: SchemaData;

    onRequest?: RouteHandler;

    preHandler?: RouteHandler;

    handler: RouteHandler;
};

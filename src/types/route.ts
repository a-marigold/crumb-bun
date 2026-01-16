// TODO: add docs

import type { BunRequest } from 'bun';
import type { SchemaData } from './schema';

/**
 * HTTP Method primitive.
 *
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
    | 'OPTIONS'
    | 'HEAD';

export type RedirectStatusCode =
    | 300
    | 301
    | 302
    | 303
    | 304
    | 305
    | 306
    | 307
    | 308;

/**
 * HTTP Header struct.
 */
export type Header = {
    name: string;
    value: string;
};

export type Headers = ResponseInit['headers'];

export type RouteRequestParams<T extends string | undefined = undefined> = [
    T
] extends [string]
    ? {
          [K in T]: string;
      }
    : { [key: string]: string | undefined };

/**
 *
 *
 * Type of RouteRequest generic
 *
 *
 *
 *
 *
 */
export interface RouteRequestGeneric {
    body?: unknown;

    params?: string;
}

/**
 * Type of route handler `request`
 */
export interface RouteRequest<
    T extends RouteRequestGeneric = RouteRequestGeneric
> extends Omit<BunRequest, 'params'> {
    params: RouteRequestParams<T['params']>;

    /**
     * #### Parses and validates body of request.
     *
     * - Parses body to JSON or text
     * - Validates body with `schemaValidator` if it is provided.
     *
     * @returns Promise with handled body
     *
     * @example
     *
     * ```typescript
     * request.handleBody().then((bodyData) => {
     *   console.log(bodyData);
     * })
     * ```
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
    /**
     * Sets the response header.
     *
     *
     *
     *
     * Overrides header if it already exists.
     *
     * Case of `name` is not important. Names 'content-type', 'Content-Type', 'CoNteNt=TYPE' are the same.
     *
     *
     * @param name header name
     * @param value header value
     *
     *
     * @example
     * ```typescript
     * response.setHeader('Access-Control-Allow-Origin', '*');
     * // The code below will override the header above
     * response.setHeader('access-control-allow-origin', 'https://bun-crumb.vercel.app');
     * ```
     */
    setHeader: (name: Header['name'], value: Header['value']) => void;

    send: (data: T['body'], options?: ResponseOptions) => void;

    /**
     * Sets `Location` header to provided `url` and `response.status` to provided `status`
     *
     *
     *
     * @param url `Location` to redirect
     *
     * @param status redirect http code (`3xx`)
     *
     * @example
     *
     *
     * ```typescript
     * return response.redirect('https://bun-crumb.vercel.app', 302);
     * ```
     * The same behaviour is
     * ```typescript
     * response.setHeader('Location', 'https://bun-crumb.vercel.app');
     * return response.send('', {status: 302});
     * ```
     */
    redirect: (
        url: string,
        status?: RedirectStatusCode | (number & {})
    ) => void;
}

export type Route = Partial<Record<HttpMethod, RouteOptions>>;

export type RouteHandler = (
    request: RouteRequest,

    response: RouteResponse
) => Promise<void> | void;

export type RouteOptions = {
    url: string;
    method: HttpMethod;

    schema?: SchemaData;

    handler: RouteHandler;
};

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

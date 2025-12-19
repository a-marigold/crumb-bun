export type HttpMethod =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH1'
    | 'DELETE'
    | 'OPTIONS';

export type Header = {
    name: string;
    value: string;
};

export type Headers = {
    [K in string]: string;
};

export type RouteRequest<T extends { body: unknown } = { body: unknown }> =
    Omit<Request, 'body'> & {
        body: T extends { body: unknown } ? T['body'] : unknown;
    };

export interface RouteResponse<
    T extends { body: unknown } = { body: unknown }
> {
    setHeader: (name: Header['name'], value: Header['value']) => void;

    send: (data: T['body']) => void;
}

export type Route = {
    url: string;
    method: HttpMethod;

    onRequest?: (request: RouteRequest, response: RouteResponse) => void;

    preHandler?: (request: RouteRequest, response: RouteResponse) => void;

    handler: (request: RouteRequest, response: RouteResponse) => void;
};

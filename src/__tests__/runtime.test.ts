import { describe, it, expect } from 'bun:test';

import type { BunRequest } from 'bun';

import { HttpError } from '../errors/HttpError';
import type { RouteRequest, RouteResponse, Validate } from '../types';
import { wrapRouteCallback } from '../server';

describe('wrapRouteCallback', () => {
    it('should return a working wrapped callback', () => {
        const responseData = { key: 'value' };
        const testWrappedCallback = wrapRouteCallback({
            url: '/test',

            method: 'GET',

            handler: (_request, response) => {
                return response.send(responseData);
            },
        });

        const testRequest = new Request('http://localhost:3000') as BunRequest;

        testWrappedCallback(testRequest).then((response) => {
            const bodyPromise = response.json();

            bodyPromise.then((bodyData) => {
                expect(response.headers.get('Content-Type')).toBe(
                    'application/json'
                );

                expect(bodyData).toEqual(responseData);
            });
        });
    });

    describe('handler', () => {
        it('should catch async errors', () => {
            type RequestData = { password: string };

            const schemaValidator: Validate = (data, schema) => {
                return (
                    typeof data === 'object' &&
                    data !== null &&
                    'password' in data &&
                    typeof data.password === (schema as RequestData).password
                );
            };

            const schema = { password: 'string' } as unknown as undefined;

            const wrappedCallback = wrapRouteCallback(
                {
                    url: '/test',
                    method: 'POST',
                    schema,
                    handler: async (
                        request: RouteRequest<{ body: RequestData }>,
                        response
                    ) => {
                        await request.handleBody();

                        return response.send('Success');
                    },
                },
                schemaValidator
            );

            const testRequestData = { password: 123 };

            const testRequest = new Request('http://localhost:3000', {
                body: JSON.stringify(testRequestData),
                headers: { 'Content-Type': 'application/json' },
            }) as BunRequest;

            wrappedCallback(testRequest).then((response) => {
                expect(response.ok).toBe(false);

                response.text().then((bodyData) => {
                    expect(bodyData).toBe('Request does not match schema');
                });
            });
        });

        it('should automatically set "application/json" as "Content-Type" header when an object sent', () => {
            const jsonResponseData = { key: 'value' };
            const jsonWrappedCallback = wrapRouteCallback({
                url: '/test',
                method: 'GET',
                handler: (_request, response) => {
                    response.send(jsonResponseData);
                },
            });

            const testRequest = new Request(
                'https://localhost:3000'
            ) as BunRequest;

            jsonWrappedCallback(testRequest).then((response) => {
                const bodyPromise = response.json();

                bodyPromise.then((bodyData) => {
                    expect(bodyData).toEqual(jsonResponseData);
                    expect(response.headers.get('Content-Type')).toBe(
                        'application/json'
                    );
                });
            });
        });

        it('should automatically set "text/plain" as "Content-Type" header when a string sent', () => {
            const textResponesData = 'Hello';
            const jsonWrappedCallback = wrapRouteCallback({
                url: '/test',
                method: 'GET',
                handler: (_request, response) => {
                    response.send(textResponesData);
                },
            });
            const testRequest = new Request(
                'https://localhost:3000'
            ) as BunRequest;

            jsonWrappedCallback(testRequest).then((response) => {
                const bodyPromise = response.text();

                bodyPromise.then((bodyData) => {
                    expect(bodyData).toBe(textResponesData);
                    expect(response.headers.get('Content-Type')).toBe(
                        'text/plain'
                    );
                });
            });
        });

        it('should return a Response with error if request does not match schema', () => {
            type TestBody = { price: number };

            const testSchema = { price: 100 };

            const schemaValidator: Validate = (data, schema) => {
                return (
                    typeof data === 'object' &&
                    data !== null &&
                    'price' in data &&
                    'price' in (schema as TestBody) &&
                    typeof data.price === typeof (schema as TestBody).price
                );
            };

            const testWrappedCallback = wrapRouteCallback(
                {
                    url: '/test',

                    method: 'POST',

                    schema: testSchema as unknown as undefined,

                    handler: (
                        request: RouteRequest<{ body: TestBody }>,

                        response: RouteResponse<{ body: TestBody }>
                    ) => {
                        return request.handleBody().then((bodyData) => {
                            return response.send({
                                price: Number(bodyData.price),
                            });
                        });
                    },
                },
                schemaValidator
            );

            const testRequestData = { price: '100' };

            const testRequest = new Request('http://localhost:3000', {
                body: JSON.stringify(testRequestData),

                headers: { 'Content-Type': 'application/json' },
            }) as BunRequest;

            testWrappedCallback(testRequest).then((response) => {
                expect(response.status).toBe(400);

                expect(response.ok).toBe(false);
            });
        });
    });

    describe('setHeader', () => {
        it('should not set "Content-Type" header after "response.send" function if this header already exists', () => {
            const userContentType = 'x-www-from-urlencoded';

            const userBodyData = String(new URLSearchParams({ test: 'true' }));

            const wrappedCallback = wrapRouteCallback({
                url: '/test',

                method: 'GET',

                handler: (
                    _request,
                    response: RouteResponse<{ body: string }>
                ) => {
                    response.setHeader('cOnTent-TYPE', userContentType);

                    return response.send(userBodyData);
                },
            });

            const request = new Request('http://localhost:3000') as BunRequest;

            wrappedCallback(request).then((response) => {
                const bodyPromise = response.text();

                const responseContentType =
                    response.headers.get('content-type');

                expect(responseContentType).toBe(userContentType);

                bodyPromise.then((bodyData) => {
                    expect(bodyData).toBe(userBodyData);
                });
            });
        });
    });

    describe('redirect', () => {
        it('should automatically set `response.status` to 302', () => {
            const redirectLocation = 'https://bun-crumb.vercel.app';

            const wrappedCallback = wrapRouteCallback({
                url: '/test',
                method: 'GET',
                handler: (_request, response) => {
                    return response.redirect(redirectLocation);
                },
            });

            const request = new Request('http://localhost:3000') as BunRequest;
            wrappedCallback(request).then((response) => {
                expect(response.headers.get('locaTioN')).toBe(redirectLocation);

                expect(response.status).toBe(302);
            });
        });
    });
});

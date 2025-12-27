import { describe, it, expect } from 'bun:test';

import type { BunRequest, password } from 'bun';

import { HttpError } from '../errors/HttpError';

import { handleBody, wrapRouteCallback } from '../server';

import type { Validate } from '../types';

import type { RouteRequest, RouteResponse } from '../types';

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

    it('should catch async errors from "request.handleBody" function', () => {
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
                    const body = await request.handleBody();

                    response.send('Success');
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

        const testRequest = new Request('https://localhost:3000') as BunRequest;

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
        const testRequest = new Request('https://localhost:3000') as BunRequest;

        jsonWrappedCallback(testRequest).then((response) => {
            const bodyPromise = response.json();

            bodyPromise.then((bodyData) => {
                expect(bodyData).toBe(textResponesData);
                expect(response.headers.get('Content-Type')).toBe('text/plain');
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

describe('handleBody', () => {
    it('should return a correct parsed json', () => {
        const testData = { key: 'value' };

        const testRequest = {
            json: () => {
                return Promise.resolve(testData);
            },
        } as BunRequest;

        handleBody(testRequest, 'application/json').then((bodyData) => {
            expect(bodyData).toEqual(testData);
        });
    });

    it('should return a correct parsed text/plain', () => {
        const testData = 'Test string';

        const testRequest = {
            text: () => {
                return Promise.resolve(testData);
            },
        } as BunRequest;

        handleBody(testRequest, 'text/plain').then((bodyData) => {
            expect(bodyData).toBe(testData);
        });
    });

    it('should throw an error if contentType is not supported', () => {
        const testRequest = {
            json: () => {
                return Promise.resolve({ key: 'value' });
            },
        } as BunRequest;

        handleBody(testRequest, 'image/png').catch((error) => {
            expect(error).toBeInstanceOf(HttpError);
            expect(error).toHaveProperty('status', 415);
        });
    });

    it('should handle text/plain with schema correctly', () => {
        const testData = 'Test Data';

        const testRequest = {
            text: () => {
                return Promise.resolve(testData);
            },
        } as BunRequest;

        const testSchema = 'Test Data';

        const schemaValidator: Validate = (data, schema) => {
            return data === schema;
        };

        handleBody(
            testRequest,
            'text/plain',
            testSchema as unknown as undefined,
            schemaValidator
        );
    });

    it('should throw an error if text/plain does not match schema', () => {
        const testTextData = 'Text Data';
        const testTextRequest = {
            text: () => {
                return Promise.resolve(testTextData);
            },
        } as BunRequest;
        const schema = 'Valid Text Data';

        const schemaValidator: Validate = (data, schema) => {
            return data === schema;
        };

        handleBody(
            testTextRequest,
            'text/plain',
            schema as unknown as undefined,
            schemaValidator
        ).catch((error) => {
            expect(error).toBeInstanceOf(HttpError);

            expect(error).toHaveProperty('status', 400);
        });
    });

    it('should throw an error if json does not match schema', () => {
        const testJsonData = { name: 'Json' };
        const testJsonRequest = {
            json: () => {
                return Promise.resolve(testJsonData);
            },
        } as BunRequest;

        const schema = { quantity: 16, width: 10 };

        const schemaValidator: Validate = (data, schema) => {
            return JSON.stringify(data) === JSON.stringify(schema);
        };

        handleBody(
            testJsonRequest,
            'application/json',

            schema as unknown as undefined,
            schemaValidator
        ).catch((error) => {
            expect(error).toBeInstanceOf(HttpError);
            expect(error).toHaveProperty('status', 400);
        });
    });
});

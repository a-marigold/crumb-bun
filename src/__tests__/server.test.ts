import { describe, it, expect } from 'bun:test';

import type { BunRequest } from 'bun';

import { HttpError } from '../errors/HttpError';

import {
    handleBody,
    wrapRouteCallback,
    prepareRoute,
    prepareRoutes,
} from '../server';

import type { Routes } from '../server';

import type { Validate } from '../types/schema';

describe('wrapRouteCallback', () => {
    it('should return a working wrapped callback', () => {
        const responseData = 'Hello';

        const testWrappedCallback = wrapRouteCallback({
            url: '/test',
            method: 'GET',

            handler: (request, response) => {
                return response.send(responseData);
            },
        });

        const testRequest = new Request('http://localhost:3000') as BunRequest;

        testWrappedCallback(testRequest).then((response) => {
            const bodyPromise = response.json();

            bodyPromise.then((data) => {
                expect(response.headers.get('Content-Type')).toBe('text/plain');
                expect(data).toBe(responseData);
            });
        });
    });
});

describe('prepareRoute', () => {
    it('should return a working prepared route', () => {
        const responseData = { key: 'value' };

        const testPreparedRoute = prepareRoute({
            POST: {
                url: '/test/url',
                method: 'POST',

                handler: (request, response) => {
                    return response.send(responseData);
                },
            },
        });

        expect(testPreparedRoute).toHaveProperty('POST');
        expect(testPreparedRoute).not.toHaveProperty('GET');

        const testRequest = new Request('http://localhost:3000') as BunRequest;

        testPreparedRoute.POST?.(testRequest).then((response) => {
            const bodyPromise = response.json();

            bodyPromise.then((body) => {
                expect(response.headers.get('Content-Type')).toBe(
                    'application/json'
                );
                expect(body).toEqual(responseData);
            });
        });
    });
});

describe('prepareRoutes', () => {
    it('should return correct prepared routes', () => {
        const testRoutes: Routes = new Map([
            [
                '/test1',
                {
                    GET: {
                        url: '/test1',
                        method: 'GET',
                        handler: (request, response) => {},
                    },
                    POST: {
                        url: '/test1',
                        method: 'POST',
                        handler: (request, response) => {},
                    },
                },
            ],

            [
                '/test2',
                {
                    PATCH: {
                        url: '/test2',
                        method: 'PATCH',
                        handler: (request, response) => {},
                    },
                },
            ],
        ]);

        const testPreparedRoutes = prepareRoutes(testRoutes);

        expect(
            '/test1' in testPreparedRoutes &&
                'GET' in testPreparedRoutes['/test1'] &&
                'POST' in testPreparedRoutes['/test1']
        ).toBe(true);

        expect(
            '/test2' in testPreparedRoutes &&
                'PATCH' in testPreparedRoutes['/test2']
        ).toBe(true);

        expect(
            '/test2' in testPreparedRoutes &&
                'GET' in testPreparedRoutes['/test2']
        ).toBe(false);

        expect(testPreparedRoutes['/test1']?.GET).toBeTypeOf('function');
        expect(testPreparedRoutes['/test2']?.PATCH).toBeTypeOf('function');
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

        const schema = 'Test Data';

        const schemaValidator: Validate = (data, schema) => {
            return data === testData;
        };

        handleBody(testRequest, 'text/plain', schema, schemaValidator);
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
            schema,
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
            schema,
            schemaValidator
        ).catch((error) => {
            expect(error).toBeInstanceOf(HttpError);
            expect(error).toHaveProperty('status', 400);
        });
    });
});

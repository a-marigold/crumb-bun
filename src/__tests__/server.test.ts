import { describe, it, expect, test } from 'bun:test';

import type { BunRequest } from 'bun';

import {
    wrapRouteCallback,
    prepareRoute,
    prepareRoutes,
    listen,
} from '../server';
import type { Routes } from '../server';

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

import { describe, it, expect } from 'bun:test';

import type { BunRequest } from 'bun';

import {
    wrapRouteCallback,
    prepareRoute,
    prepareRoutes,
    listen,
} from '../server';

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
        const testPreparedRoute = prepareRoute({
            POST: {
                url: '/test/url',
                method: 'POST',

                handler: (request, response) => {
                    return response.send({ key: 'value' });
                },
            },
        });

        expect(testPreparedRoute).toHaveProperty('POST');
        expect(testPreparedRoute).not.toHaveProperty('GET');

        const testRequest = new Request('http://localhost:3000') as BunRequest;

        testPreparedRoute.POST?.(testRequest).then((response) => {
            const bodyPromise = response.json();
        });
    });
});

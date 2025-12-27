import { describe, it, expect } from 'bun:test';

import type { BunRequest } from 'bun';

import { prepareRoute, prepareRoutes } from '../server';
import type { Routes } from '../server';

describe('prepareRoute', () => {
    it('should return a working prepared route', () => {
        const responseData = { key: 'value' };

        const testPreparedRoute = prepareRoute({
            POST: {
                url: '/test/url',
                method: 'POST',

                handler: (_request, response) => {
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

                        handler: () => {},
                    },
                    POST: {
                        url: '/test1',
                        method: 'POST',
                        handler: () => {},
                    },
                },
            ],

            [
                '/test2',
                {
                    PATCH: {
                        url: '/test2',
                        method: 'PATCH',
                        handler: () => {},
                    },
                },
            ],
        ]);

        const testPreparedRoutes = prepareRoutes(testRoutes);

        expect(Object.keys(testPreparedRoutes).length).toBe(2);

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

    it('should clear routes after preparing correctly', () => {
        const testRoutes: Routes = new Map([
            [
                '/test',
                {
                    GET: { url: '/test', method: 'GET', handler: () => {} },
                    POST: {
                        url: '/test',
                        method: 'POST',
                        preHandler: () => {},
                        handler: () => {},
                    },
                },
            ],
            [
                '/test1',
                {
                    GET: { url: '/test', method: 'GET', handler: () => {} },
                    POST: {
                        url: '/test',
                        method: 'POST',
                        preHandler: () => {},
                        handler: () => {},
                    },
                },
            ],
            [
                '/test2',
                {
                    GET: { url: '/test', method: 'GET', handler: () => {} },
                    POST: {
                        url: '/test',
                        method: 'POST',
                        preHandler: () => {},
                        handler: () => {},
                    },
                },
            ],
        ]);

        prepareRoutes(testRoutes);

        expect(testRoutes.size).toBe(0);
    });
});

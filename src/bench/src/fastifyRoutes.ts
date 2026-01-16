import Fastify from 'fastify';

import { MB_MULTIPLIER } from './constants/MB_MULTIPLIER';

const fastify = Fastify();

console.log(
    `Initial memory usage: ${process.memoryUsage().rss / MB_MULTIPLIER}mb`
);

const createRoutesLoopStart = performance.now();
for (let i = 0; i <= 1_000; i++) {
    fastify.route({
        url: `/test${i}`,
        method: 'GET',
        preHandler: () => {},

        handler: () => {},
    });

    fastify.route({
        url: `/test${i}`,
        method: 'POST',
        preHandler: () => {},
        handler: () => {},
    });

    fastify.route({
        url: `/test${i}`,
        method: 'DELETE',

        preHandler: () => {},
        handler: () => {},
    });
}

const createRoutesLoopEnd = performance.now();

console.log(
    `Created 1_000 fastify routes in ${
        createRoutesLoopEnd - createRoutesLoopStart
    }ms`
);

console.log(`Memory usage: ${process.memoryUsage().rss / MB_MULTIPLIER}mb`);

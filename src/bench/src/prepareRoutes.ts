import { createRoute } from '../../route';
import { prepareRoutes, _routes } from '../../server';

import { MB_MULTIPLIER } from './constants/MB_MULTIPLIER';

console.log(
    `Initial memory usage: ${process.memoryUsage().rss / MB_MULTIPLIER}mb`
);

const createRoutesLoopStart = performance.now();
for (let i = 0; i <= 1_000_000; i++) {
    createRoute({
        url: `/test${i}`,
        method: 'POST',

        handler: (_request, _response) => {},
    });
    createRoute({
        url: `/test${i}`,

        method: 'GET',

        handler: (_request, _response) => {},
    });
    createRoute({
        url: `/test${i}`,

        method: 'DELETE',

        handler: (_request, _response) => {},
    });
}

const createRoutesLoopEnd = performance.now();

console.log(
    `Created 1_000_000 routes with 'GET', 'POST' and 'DELETE' methods in ${
        createRoutesLoopEnd - createRoutesLoopStart
    }ms`
);

console.log(`Memory usage: ${process.memoryUsage().rss / MB_MULTIPLIER}mb`);
console.log(`'_routes' length: `, _routes.size);

const prepareRoutesStart = performance.now();

prepareRoutes(_routes);

const prepareRoutesEnd = performance.now();

console.log(
    `'prepareRoutes' function called with 1_000_000 routes in ${
        prepareRoutesEnd - prepareRoutesStart
    }ms`
);

console.log(`Memory usage: ${process.memoryUsage().rss / MB_MULTIPLIER}mb`);

console.log(`'_routes' length: `, _routes.size);

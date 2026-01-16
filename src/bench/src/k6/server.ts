import { PORT } from './constants';

import { listen, createRoute } from 'bun-crumb';

createRoute({
    url: '/json',

    method: 'GET',

    handler: (_reqeust, response) => {
        return response.send({ hello: 'world' });
    },
});
createRoute({
    url: '/',
    method: 'GET',
    handler: (_request, response) => {
        return response.send('Hello world');
    },
});

listen({ port: PORT });

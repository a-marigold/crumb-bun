import { _routes } from './server';

import type { Route } from './types';

export const createRoute = (route: Route) => {
    _routes.set(route.url, route);
};

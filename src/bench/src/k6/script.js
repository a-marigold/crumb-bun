import { PORT } from './constants';

import http from 'k6/http';

export const options = {
    vus: 3200,

    duration: '30s',
};

export default () => {
    http.get('http://localhost:' + PORT + '/json');
};

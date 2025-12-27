# <div align='center'> <a> **Bun Crumb** </a> </div>

<div align='center'>  
 [![CI](https://github.com/a-marigold/crumb/actions/workflows/ci.yaml/badge.svg)](https://github.com/a-marigold/crumb/actions) [![bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff)](https://bun.com) [![npm](https://img.shields.io/npm/v/bun-crumb)](https://npmjs.com/package/bun-crumb) [![Status](https://img.shields.io/badge/BETA-darkgreen?style=for-the-badge)](https://npmjs.com/package/bun-crumb)

</div>

### Features

-   Only Bun is supported

-   No classes

-   Uses Bun’s HTTP API

### Installation

```bash
bun add bun-crumb
```

### Usage

Handling Requests

```typescript
import { createRoute, type RouteResponse } from 'bun-crumb';

type Product = { title: string; price: number; id: number };

const products: Product[] = [];

createRoute({
    url: '/products',
    method: 'GET',
    handler: (request, response: RouteResponse<{ body: Product[] }>) => {
        return response.send(
            [
                { title: 'cookie', price: 100, id: 1 },
                { title: 'bread', price: 1600, id: 2 },
            ],
            { status: 200 }
        );
    },
});
```

&nbsp;

Middleware / Pre-handlers

```typescript
import { createRoute, type RouteResponse } from 'bun-crumb';

type Product = { title: string; price: number; id: number };

const products: Product[] = [];

createRoute({
    url: '/products',
    method: 'POST',
    preHandler: (request, response) => {
        if (products.find((product) => product.id === request.body.id)) {
            return response.send(
                { message: 'Product with this id already exists' },
                { status: 409 }
            );
        }
    },
    handler: (request, response: RouteResponse<{ body: Product }>) => {
        products.push(body);

        return response.send(body, { status: 201 });
    },
});
```

&nbsp;

Setting Headers and Status

```typescript
import { createRoute } from 'bun-crumb';

createRoute({
    url: '/auth',
    method: 'POST',
    handler: (request, response) => {},
});
```

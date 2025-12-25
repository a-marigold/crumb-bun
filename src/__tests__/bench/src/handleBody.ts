import type { BunRequest } from 'bun';

import { record, object, string, number, boolean } from 'zod';
import type { infer as zInfer } from 'zod';

import { handleBody } from 'crumb-bun';
import type { Validate } from 'crumb-bun';

import { MB_MULTIPLIER } from './constants/MB_MULTIPLIER';

const requestDataSchema = record(
    string(),
    object({ key: object({ key: number() }), boolean: boolean() })
);

const requestData: Partial<zInfer<typeof requestDataSchema>> = {};

const createRequestDataLoopStart = performance.now();
for (let i = 0; i < 100_000; i++) {
    requestData[`key_${i}`] = { key: { key: i }, boolean: true };
}
const createRequestDataLoopEnd = performance.now();

console.log(
    `Request data object with 100_000 elements created in ${
        createRequestDataLoopEnd - createRequestDataLoopStart
    }ms`
);

console.log(`Memory usage: ${process.memoryUsage().rss / MB_MULTIPLIER}mb`);

const testRequest = new Request('http://localhost:3000', {
    body: JSON.stringify(requestData),
}) as BunRequest;

const schemaValidator: Validate = (data, schema) => {
    return schema.zod.safeParse(data).success;
};

const handleBodyStart = performance.now();
handleBody(
    testRequest,
    'application/json',
    { zod: requestDataSchema },
    schemaValidator
);
const handleBodyEnd = performance.now();

console.log(
    `'handleBody' function called in ${handleBodyEnd - handleBodyStart}ms`
);
console.log(`Memory usage: ${process.memoryUsage().rss / MB_MULTIPLIER}mb`);
for (const element of new Map()) {
}

import type { ZodType } from 'zod';

declare module 'bun-crumb' {
    interface Schema {
        zod: ZodType;
    }
}

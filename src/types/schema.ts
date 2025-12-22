/**
 * The global Schema type that will be used in every
 *
 * @default {}
 *
 * @example
 *
 * ```typescript
 * // types/global.d.ts
 * import type { ZodType } from 'zod';
 *
 * declare module 'crumb-bun' {
 *    interface Schema {
 *        zod: ZodType
 *    }
 * }
 * ```
 * &nbsp;
 * ```json
 * // tsconfig.json
 * {
 *    "include": ["types"]
 * }
 * ```
 */
export interface Schema {}

/**
 * The schema validator function type.
 *
 * Supports any schemas like `zod`, `ajv`, `yup`
 */
export type Validate = (data: unknown, schema: Schema) => boolean;

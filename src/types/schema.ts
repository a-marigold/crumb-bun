/**
 * The global Schema type that reflects schema type in `Validate` function
 *
 * @default {}
 *
 * @example
 *
 * ```typescript
 * // types/global.d.ts
 * import type { ZodType } from 'zod';
 *
 *
 *
 *
 *
 * declare module 'crumb-bun' {
 *    interface Schema {
 *        zod: ZodType;
 *    }
 * }
 * ```
 *
 * &nbsp;
 * ```json
 * // tsconfig.json
 * {
 *    "include": ["types"]
 * }
 * ```
 */
// biome-ignore lint: lint/correctness/noUnusedFunctionParameters
export interface Schema {}

/**
 * Straight `Schema` type
 */
export type SchemaData = Schema[keyof Schema];

/**
 * The schema validator function type.
 *
 * Supports any schemas like `zod`, `ajv`, `yup`
 */
export type Validate = (data: unknown, schema: SchemaData) => boolean;

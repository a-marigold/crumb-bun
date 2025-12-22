export interface Schema {}

export interface Validator {
    validate: (data: unknown, schema: Schema) => void;
}

import { email, required, helpers } from '@vuelidate/validators/dist/index.esm';
import { unwrap } from './validation';
const sameAs = (field) => ({
    $validator: (value, context) => value === unwrap(context[field].$model),
    $message: `This needs to be the same as the ${field} field.`,
});
const minLength = (length) => ({
    $validator: (value) => !helpers.req(value) || helpers.len(value) >= length,
    $message: `This field should be at least ${length} long.`,
});
export { required, email, minLength, sameAs, };

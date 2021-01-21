// https://github.com/vuelidate/vuelidate/tree/next/packages/validators
import { email, required /* sameAs, minLength */, helpers } from '@vuelidate/validators/dist/index.esm';
import { Validator } from './types';


const sameAs = (field) => ({
  $validator: (value, context) => value === context[field].$model,
  $message: `This needs to be the same as the ${field} field.`,
}) as Validator;

const minLength = (length) => ({
  $validator: (value) => !helpers.req(value) || helpers.len(value) >= length,
  $message: `This field should be at least ${length} long.`,
}) as Validator;


export {
  // simple
  required,
  email,

  // complex (depend on args or context)
  minLength,
  sameAs,
  // etc..
};


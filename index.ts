import useValidation from './validation';
import * as validators from './validators';

export default useValidation;
export const {
  required,
  email,
  //
  minLength,
  sameAs,
} = validators;

import useValidation from './validation';
import * as validators from './validators';

export default useValidation;
export const {
  required,
  email,
  date,
  //
  minLength,
  sameAs,
} = validators;

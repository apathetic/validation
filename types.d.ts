import { Ref } from 'vue-demi';


export interface UseValidation<S, V> {
  setValues: (values: V) => V;
  setErrors: (errors: any) => ValidationGroup; // TODO update any to JSON error
  form: ValidationGroup
}

// Schema types
// ----------------------

export type ValidationSchema = SchemaRules | SchemaValues;

interface SchemaRules {
  [fieldName: string]: Record<string, Validator>;
}

interface SchemaValues {
  [fieldName: string]: {
    value: any;
    rules: Record<string, Validator>;
  }
}

export interface Validator {
  $validator: (value: any, context?) => boolean;
  $message: string;
}


// Form validation types
// ----------------------

export interface ValidationField {
  $model: Ref<any>;
  $dirty: Ref<boolean>;
  $invalid: Ref<boolean>;
  $error: Ref<boolean>;
  $errors: Ref<ValidationError[]>;
}

interface ValidationMeta {
  $dirty: boolean;
  $invalid: boolean;
  $errors: Array<any>;
}

interface ValidationError {
  $property: any;
  $validator: string;
  $message: string;
}

export type ValidationGroup =
  Record<string, ValidationField> &
  ValidationMeta;

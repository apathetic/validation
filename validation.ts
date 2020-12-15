/**

  Validation: Generates a reactive `form` object that dynamically
              sets the following props for each field (or group thereof):

    • $dirty:   if the field was interacted with at least once
    • $invalid: if a field passes validation or not
    • $error:   if the field is _both_ $dirty and $invalid
    • $errors:  an array of the failed validations; contains the
                prop name, the failed rule, and an error message

  References:

    • @see https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/mixins/validatable/index.ts
    • @see https://github.com/pikax/vue-composable/blob/master/packages/vue-composable/src/validation/validation.ts
    • @see https://github.com/logaretm/vee-validate/blob/next/packages/core/src/useField.ts

 */

import { ref, reactive, computed, isRef } from '@vue/composition-api';
import { ValidationSchema, ValidationGroup, ValidationField, UseValidation } from './types';

/**
 * Helper function to access value of a reactive prop
 * @param val
 */
function unwrap (val) {
  return isRef(val)
    ? val.value
    : val;
}


export default function useValidation<S, V>(schema: S, values?: V): UseValidation<S, V> {
  let form = {};

  if (values) {
    setValues(values);
  }


  /**
  * Builds a reactive `form` that will respond to updates in user-data and
  * validate against them. This function can also be called recursively to build
  * out nested form "groups".
  * @param {ValidationSchema} schema An object describing the validation rules for each `value`.
  * @param {object?} values An data object of the fields to be validated.
  * @returns {ValidationGroup}
  */
  function buildGroup(schema: ValidationSchema, values): ValidationGroup {
    const group: Record<string, ValidationField> = {};
    const validations: ValidationField[] = [];
    let $dirty;
    let $errors;
    let $invalid;

    for (const property of Object.keys(schema)) {
      const rules = schema[property];
      const value = values[property];
      let field;

      if (value === undefined) {
        throw Error(`Found validation rules for "${property}", but no value for "${property}".`);
      }

      field = buildField({ value, rules, property }) as ValidationField;

      validations.push(field); // just used internally. Easier to bind $dirty / $invalid things on an array
      group[property] = field; // returned to component for composition
    }

    $errors = computed(() => {
      return validations
        .filter((v) => unwrap(v).$errors.length)
        .reduce((errors, v) => {
          return errors.concat(...unwrap(v).$errors);
        }, []);
    });

    $dirty = computed(() => {
      return validations
        .some((x) => x.$dirty); // if `group` is: (validationField | validationGroup) ...,then x.$dirty || x.$dirty
    });

    $invalid = computed(() => {
      return validations
        .some((x) => !!unwrap(x.$invalid));
    });

    return reactive({
      ...group,
      $errors,
      $invalid,
      $dirty,
    });
  }


  /**
  * Builds out a single field from the `schema` data. The result is a
  * reactive object comprised of a starting value plus the set of `rules`
  * used to validate any changes to it.
  * @param {object} field The configuration schema for this field
  * @param {any} field.value The default `value` of the field
  * @param {Validator} field.rules The list of rules used to validate `value`
  * @param {string} field.property The name of the field property.
  * @returns {ValidationField}
  */
  function buildField ({ value, rules, property }): ValidationField {
    const results = {};
    const ruleKeys = Object.keys(rules);
    const $dirty = ref(false);
    const $invalid = computed(() => !Object.values(results).every(unwrap));
    const $error = computed(() => $invalid.value && $dirty.value);

    const $errors = computed(() => ruleKeys
      .filter((key) => !unwrap(results[key]))
      .map((key) => reactive({
        $property: property,
        $validator: key,
        $message: (typeof rules[key].$message === 'function') ? rules[key].$message(rules[key]) : (rules[key].$message || ''),
      })),
    );

    const $model = computed({
      get: () => unwrap(values![property]),
      set: (val) => {
        $dirty.value = true;
        values![property] = val;
      },
    });

    // calculate the validation results for this field's value
    ruleKeys.forEach((key) => {
      results[key] = computed(() => {
        return $dirty.value && form // note: validate only when $dirty and when `form` object is available
          ? rules[key].$validator(unwrap($model), form)
          : true;
      });
    });

    return {
      $model,
      $error,
      $errors,
      $dirty,
      $invalid,
      ...results,
    };
  }


  /**
  * Parse a server-supplied Error reponse object, in JSON Error format, and
  * apply it to the relevant fields within the generated form.
  * @param {object} values A data object containing the values to be validated.
  * @returns {object} The object of form values, useful for composition.
  */
  function setValues(vals) {
    const validations = buildGroup(schema, vals);

    Object.defineProperties(form, Object.getOwnPropertyDescriptors(validations));
    values = vals;

    return vals;
  }


  /**
  * Parses a JSON error object and updates the relevant fields within
  * the form.
  * @param {JSONError[]} errors An array of JSON error object. TODO type annotation for JSON error response
  * @returns {ValidationGroup} A reference to the reactive form, useful for composition.
  * @see https://jsonapi.org/examples/
  */
  function setErrors(errors) {
    return;
    errors.forEach((error) => {
      const [,field] = error.source?.pointer?.split('/') || 'form'; // if we don't find a particular field, set a generic "form" error
      const value = form[field]?.$model;
      const rules = schema[field] || {};

      rules['server'] = {
        $message: error.detail,
        $validator: () => false, // form[field].$dirty // ...just go away once user interacts with field ?
      };
      form[field].$dirty = true; // otherwise no validation happens
    });

    // Object.defineProperties(form, Object.getOwnPropertyDescriptors(xxx));

    return form;
  }



  return {
    form,
    setValues,
    setErrors,
  } as any;
}

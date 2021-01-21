import { isReactive, reactive, computed, isRef, ref, unref } from 'https://unpkg.com/vue@3.0.4/dist/vue.esm-browser.prod.js';

function unwrap(val) {
    return isRef(val)
        ? val.value
        : val;
}
function useValidation(schema, values) {
    let form = {};
    if (values) {
        setValues(values);
    }
    function buildGroup(schema, values) {
        const group = {};
        const validations = [];
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
            field = buildField({ value, rules, property });
            validations.push(field);
            group[property] = field;
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
                .some((x) => x.$dirty);
        });
        $invalid = computed(() => {
            return validations
                .some((x) => !!unwrap(x.$invalid));
        });
        return {
            ...group,
            $errors,
            $invalid,
            $dirty,
        };
    }
    function buildField({ value, rules, property }) {
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
        })));
        const $model = computed({
            get: () => unwrap(values[property]),
            set: (val) => {
                $dirty.value = true;
                values[property] = val;
            },
        });
        ruleKeys.forEach((key) => {
            results[key] = computed(() => {
                return $dirty.value && form
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
    function setValues(vals) {
        values = isReactive(vals) ? vals : reactive(vals);
        const validations = buildGroup(schema, values);
        Object.defineProperties(form, Object.getOwnPropertyDescriptors(validations));
        return vals;
    }
    function setErrors(errors) {
        errors.forEach((error) => {
            const [, field] = error.source?.pointer?.split('/') || 'form';
            schema[field] || {};
            form[field].$errors = computed(() => {
                const errs = form[field].$errors.value;
                errs.push({
                    $message: error.detail,
                    $validator: () => form[field].$dirty
                });
                return errs;
            });
            form[field].$dirty = true;
        });
        return form;
    }
    return {
        form:  reactive(form),
        setValues,
        setErrors,
    };
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function isFunction(val) {
  return typeof val === 'function';
}
function isObject(o) {
  return o !== null && _typeof(o) === 'object' && !Array.isArray(o);
}
/**
 * Returns a standard ValidatorObject
 * Wraps a plain function into a ValidatorObject
 * @param {NormalizedValidator|Function} validator
 * @return {NormalizedValidator}
 */

function normalizeValidatorObject(validator) {
  return isFunction(validator.$validator) ? validator : {
    $validator: validator
  };
}
function withAsync(validator) {
  var normalized = normalizeValidatorObject(validator);
  normalized.$async = true;
  return normalized;
}

/**
 * Allows attaching parameters to a validator
 * @param {Object} $params
 * @param {NormalizedValidator|Function} $validator
 * @return {NormalizedValidator}
 */

function withParams($params, $validator) {
  if (!isObject($params)) throw new Error("[@vuelidate/validators]: First parameter to \"withParams\" should be an object, provided ".concat(_typeof($params)));
  if (!isObject($validator) && !isFunction($validator)) throw new Error("[@vuelidate/validators]: Validator must be a function or object with $validator parameter");
  var validatorObj = normalizeValidatorObject($validator);
  validatorObj.$params = Object.assign({}, validatorObj.$params, {}, $params);
  return validatorObj;
}

/**
 * @callback MessageCallback
 * @param {Object} params
 * @return String
 */

/**
 * Attaches a message to a validator
 * @param {MessageCallback | String} $message
 * @param {NormalizedValidator|Function} $validator
 * @return {NormalizedValidator}
 */

function withMessage($message, $validator) {
  if (!isFunction($message) && typeof unref($message) !== 'string') throw new Error("[@vuelidate/validators]: First parameter to \"withMessage\" should be string or a function returning a string, provided ".concat(_typeof($message)));
  if (!isObject($validator) && !isFunction($validator)) throw new Error("[@vuelidate/validators]: Validator must be a function or object with $validator parameter");
  var validatorObj = normalizeValidatorObject($validator);
  validatorObj.$message = $message;
  return validatorObj;
}

var req = function req(value) {
  value = unref(value);
  if (Array.isArray(value)) return !!value.length;

  if (value === undefined || value === null) {
    return false;
  }

  if (value === false) {
    return true;
  }

  if (value instanceof Date) {
    // invalid date won't pass
    return !isNaN(value.getTime());
  }

  if (_typeof(value) === 'object') {
    for (var _ in value) {
      return true;
    }

    return false;
  }

  return !!String(value).length;
};
/**
 * Returns the length of an arbitrary value
 * @param {Array|Object|String} value
 * @return {number}
 */

var len = function len(value) {
  value = unref(value);
  if (Array.isArray(value)) return value.length;

  if (_typeof(value) === 'object') {
    return Object.keys(value).length;
  }

  return String(value).length;
};
/**
 * Regex based validator template
 * @param {RegExp} expr
 * @return {function(*=): boolean}
 */

function regex(expr) {
  return function (value) {
    value = unref(value);
    return !req(value) || expr.test(value);
  };
}



var common = /*#__PURE__*/Object.freeze({
  __proto__: null,
  withParams: withParams,
  withMessage: withMessage,
  req: req,
  len: len,
  regex: regex,
  unwrap: unref,
  withAsync: withAsync
});

var emailRegex = /^(?:[A-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}(?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
var email = regex(emailRegex);

/**
 * Validate if value is an email.
 * @type {NormalizedValidator}
 */

var email$1 = {
  $validator: email,
  $message: 'Value is not a valid email address'
};

/**
 * Validates if a value is empty.
 * @param {String | Array | Date | Object} value
 * @returns {boolean}
 */

function required (value) {
  if (typeof value === 'string') {
    value = value.trim();
  }

  return req(value);
}

/**
 * Check if a value is empty or not.
 * @type {NormalizedValidator}
 */

var required$1 = {
  $validator: required,
  $message: 'Value is required'
};

const sameAs = (field) => ({
    $validator: (value, context) => value === unwrap(context[field].$model),
    $message: `This needs to be the same as the ${field} field.`,
});
const minLength = (length) => ({
    $validator: (value) => !common.req(value) || common.len(value) >= length,
    $message: `This field should be at least ${length} long.`,
});

var validators = /*#__PURE__*/Object.freeze({
    __proto__: null,
    required: required$1,
    email: email$1,
    minLength: minLength,
    sameAs: sameAs
});

export { email$1 as e, minLength as m, required$1 as r, sameAs as s, useValidation as u, validators as v };

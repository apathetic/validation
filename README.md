# Validation

> A schema-driven validation framework for Vue, providing reactive, client-side validation.

The Validation composable is a _reactive form object_. This object is consumed by the page component and used in its template, where it will automatically validate any user-entered data.

It requires a set of `values` (ie. component data) and `rules` to validate the them. The rules are a JSON-schema that define which inputs on a page need validation, and how.

## At a Glance

- Schema-based. Validation rules and structure may be imported, keeping the component lean
- Flexible. Simply provide the validation with rules + values
  - use the component's `data` as `values`, and provide rules elsewhere (no "black box" set up)
  - optionally, sweep away both rules and values into a schema config (for a very lean component)
- Reactive. Validation reacts to user input
- Extensible. Easy to override and add new rules
- Utilizes prior art. No need to author a new framework from scratch
- De-coupled. The reactive form-object can be injected _directly into the middleware_
  - In the middleware a `server-generated` error (in the JSON error format) may be used to _hydrate_ the validation object <sup>(now, we see how these prior efforts are coming together...)</sup>
- Optionated. May be _tightly integrated_ with the ZigZag UI. For example:
  - Dedicated wrappers (or "validation providers") such as `z-field`.
- Front-end / back-end "agnostic". The form-object can consume validation errors generated on either client or server
- Future-looking. Leverages Vue 3 composition API

## Getting Started

Setting up a validation _schema_ is easy and flexible enough to handle a variety of use-cases.

### Option 1

- set up the `values` and their validation `rules` in an external schema, and import it.

```
// schemas/validation.js
const coolSchema = { ... };
const coolValues = { ... };

export function useCoolFormValidation() {
  return useValidation(coolSchema, coolValues);
}
```

```
// coolComponent.vue
import { useCoolFormValidation } from '@/schemas';

const { form } = useCoolFormValidation();

...
computed() {
  form: () => form
}
```

The advantage in this set-up is simplicity; the disadvantage is that the component's values are not readily visible to the developer, which may be opaque in the template.

### Option 2

- use your page component's data as `values`.
- define the validation schema externally and "curry" them into the `useValidation` composable
- use the `setValues` helper from the composable to asynchronously add values when they're available

```
// schemas/index.js
const coolSchema = { ... };
export function useCoolFormValidationNoValues() {
  return useValidation(coolSchema);
}
```

```
// coolComponent.vue
import { useCoolFormValidationNoValues } from '@/schemas';
const { form, setValues } = useCoolFormValidationNoValues();

...
data() ({
  values: {
    name: '',
    email: '',
  }
}),

beforeCreate() {
  // minor shortcut:
  // after `setValues`, we make `form` a computed prop in the template while we're at it
  this.$options.computed.form = setValues(this.values);
}
```



## Validation object

`useValidation` creates a reactive `form` _validation_ object. The returned object matches the same shape as the validation schema, except each field will be decorated/returned as follows:

* There will be five (5) _core_ properties: `$model`, `$error`, `$dirty`, `$invalid` and `$errors`.

```
  "$model": "horace",
  "$error": false, // helper for: $invalid && $dirty
  "$dirty": false,
  "$invalid": false,
  "$errors": [ ... ]
```

* There will be _dynamic_ properties for each specific validation rule added (i.e. `required`, `email`, etc)
```
  // validation props. These are dynamic:
  "required": true,   // passes required check
  "minLength": false, // does not meet minLength criteria
  "email": true,      // passes email validation
  ...
```


### Validation usage in template

TODO. See Storybook for now.


## Portability

Once created, the composable creates a reactive object representating a component's data. Reactive validation bindings will automically update if any data field is updated, and can be surfaced in the template.

Note though, that it is equally possible to export the composable to the middleware, where it may be used to hydrate server-side errors; any field or validation that is then updated here will automatically be surfaced in the template where it is used.

First, we create the validation object. We'll inject both rules and values for simplicity:

```
// schemas/index
const schema = { ... };
const values = { ... };
const exampleForm = useValidation(schema, values);

export { exampleForm };
```

Then, in an action

```
export const exampleAction = async ({ commit }) => {
  try {
    const exampleData = await api.settings.getExampleData();
    ...
  } catch (error) {
    import('@/schemas/exampleForm') // WEBPACK conditional import.
      .then((exampleForm) => {
        exampleForm.setErrors(error);
      });
  }
};
```
...note that we conditionally load the module and hydrate it upon any error(s) originating from the server. That's it, we can now surface server errors anywhere in the page.  If the server response is in the JSON-error format, the framework will unwrap it and apply it to the corresponding field in the template automatically.


## z-field

The `z-field` component may be used as a field wrapper. It accepts `errors` array from validation rules, or even a single `errors[0].$message` if desired. `z-field` can wrap any other UI components, and act as a decorator for error feedback.



## References:

`Validatable` draws inspiration from multiple sources.

(Vue Composable)[https://pikax.me/vue-composable/composable/validation/validation.html]: Vue 3 composition API approach to
(Vee Validate)[https://logaretm.github.io/vee-validate/]: Vue 3 composition API + "validation provider" component
(Vuelidate)[https://github.com/vuelidate/vuelidate/blob/master/src/index.js] for model based validation
(Vuetify)[https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/mixins/validatable/index.ts]: Array validation approach

import { ref, reactive, computed, isRef, isReactive, } from 'vue-demi';
let isVue2 = false;
export function unwrap(val) {
    return isRef(val)
        ? val.value
        : val;
}
export default function useValidation(schema, values) {
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
                .reduce((errors, v) => {
                return errors.concat(...unwrap(v.$errors));
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
            const rules = schema[field] || (schema[field] = {});
            rules['server'] = {
                $message: error.detail,
                $validator: () => form[field].$dirty
            };
            const validations = buildGroup(schema, values);
            Object.defineProperties(form, Object.getOwnPropertyDescriptors(validations));
            form[field].$dirty = false;
        });
        return form;
    }
    return {
        form: isVue2 ? form : reactive(form),
        setValues,
        setErrors,
    };
}

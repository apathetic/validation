const SERVER_ERROR = [
    {
        'status': '422',
        'source': { 'pointer': '/quantity' },
        'title': 'Invalid',
        'detail': '(from ye olde server) There is insufficient quantity.',
    },
];
const ZInput = {
    name: 'z-input',
    template: `
    <z-field v-slot="slotProps">
      <input
        type="text"
        class="border p-2 rounded"
        :placeholder="slotProps.placeholder"
        :value="slotProps.modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </z-field>
  `,
};
const ZSelect = {
    template: `
    <z-field v-slot="slotProps">
      <select></select>
    </z-field>
  `
};
const ZField = {
    name: 'z-field',
    inheritAttrs: false,
    props: {
        error: String,
        hint: String,
        label: String,
        errors: Array
    },
    template: `
    <div :class="['input', {'has-error': hasError}]">
      <label v-if="label" class="block font-bold mb-1 input-label">{{ label }}</label>
      <slot v-bind="attrs" v-bind="$listeners"></slot>
      <span v-if="helperText" class="block input-hint text-small text-sm mt-1">{{ helperText }}</span>
    </div>
  `,
    computed: {
        attrs() {
            const { error, errors, hint, label, ...attrs } = this.$attrs;
            return attrs;
        },
        hasError() { return !!(this.error || this.errors && this.errors.length); },
        helperText() {
            const { errors, error, hint } = this;
            return (this.errors && this.errors.length) ? `${errors[0].$message}` :
                error ? error :
                    hint ? hint :
                        '';
        },
    }
};

export { SERVER_ERROR, ZField, ZInput, ZSelect };

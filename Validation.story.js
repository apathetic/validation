import { storiesOf } from '@storybook/vue';
import useValidation from '@/composables/validation';
import { schema, values } from '@test/fixtures/validation';

const { form: formAndValues } = useValidation(schema, values);
const { form, setValues, setErrors } = useValidation(schema);
const SERVER_ERROR = [
  {
    'status': '422',
    'source': { 'pointer': '/quantity' },
    'title':  'Invalid',
    'detail': '(from ye olde server) There is insufficient quantity.',
  },
];


storiesOf('Patterns/Form Validation (new)', module)
  .add('useValidation', () => ({
    name: 'validation-story',
    data() {
      return {
        values: setValues({
          username: 'inline',
          email: 'inl@ne',
          password: 'inline',
          samePassword: 'xxxx',
          quantity: 99,
          seniority: '',
          accomplishment: [
            { name: 'Ate lunch', id: '1' },
            { name: 'Made a div', id: '2' },
          ],
        }),
      };
    },

    computed: {
      form: () => form,
    },

    template: `
      <div>
        <h1>Validatable</h1>
        <p>Using <code>vue-observable</code> reactive bindings</p>
        <form class="grid grid-cols-2" @submit.prevent="submit">
          <z-input
            v-model="form.username.$model"
            label="Username"
            hint-text="Choose a username"
            :error-text="form.username.$error ? 'Username needs to be at least 3 characters' : ''"
          />
          <pre class="text-small">{{ form.username }}</pre>

          <z-input
            v-model="form.email.$model"
            label="Email"
            type="email"
            hint-text="Type in email"
            :error-text="form.email.$error ? 'Email must be valid' : ''"
          />
          <pre class="text-small">{{ form.email }}</pre>

          <z-input
            label="Password"
            hint-text="Create a password. (Note: lazy evaluation)"
            :error-text="form.password.$error ? 'This is required field' : ''"
            :value="form.password.$model"
            @change="(value) => form.password.$model = value"
          />
          <pre class="text-small">{{ form.password }}</pre>

          <z-input
            v-model="form.samePassword.$model"
            label="Password again"
            hint-text="confirm password"
            :error-text="!form.samePassword.matches ? 'password must match' : ''"
          />
          <pre class="text-small">{{ form.samePassword }}</pre>

          <z-input
            label="quantity"
            :value="form.quantity.$model"
            :error-text="form.quantity.$error ? form.quantity.$errors[0].$message : ''"
            hint-text="Test asynchronous validation. Will throw an error after 1 second"
            @change="handleQuantityChange"
          />
          <pre class="text-small">{{ form.quantity }}</pre>


          <z-select
            v-model="form.seniority.$model"
            label="What's your level of seniority"
            hint-text="Please choose level of seniority"
            :error-text="form.seniority.$error ? 'This is required' : ''"
            :options="[
              { name: 'Junior (<= 2 years)', id: 'junior' },
              { name: 'Mid (> 2 & <= 10 years)', id: 'mid' },
              { name: 'Senior (10+ years)', id: 'senior' }
            ]"
          />
          <pre class="text-small">{{ form.seniority }}</pre>


          <template v-if="form.seniority.$model.id === 'senior'">
          <z-select
            v-model="form.accomplishment.$model"
            label="Proudest accomplishment"
            :error-text="form.accomplishment.$error ? 'Error' : ''"
            :options="values.accomplishment"
          />
          <pre class="text-small">{{ form.accomplishment }}</pre>
          </template>

          <div class="align-self-start"><button>Submit</button></div>
          <pre class="text-small">All form results:\n$errors: {{ form.$errors }}\n$invalid: {{ form.$invalid }}\n$dirty: {{ form.$dirty }}</pre>
        </form>
      </div>
    `,

    // Another option, eg:
    // beforeCreate() {
    //   const values = this.$options.data().values;
    //   setValues(values);
    // },


    methods: {
      submit() {
        if (form.$invalid) {
          alert('invalid form');
        } else {
          alert('submitted!');
        }
      },

      async handleQuantityChange(newQuantity) {
        form.quantity.$model = newQuantity;

        try {
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(SERVER_ERROR);
            }, 1000);
          });
        } catch (e) {
          setErrors(e); // here, note we set $errors on the imported object, not on the component (ie. via `this`)
        }
      },
    },
  }))

  .add('Error provider', () => ({
    components: { 'z-field': ZField },
    computed: {
      form: () => formAndValues,
    },
    template: `
      <div>
        <p>The <strong>ZField</strong> now doubles as an "Error Provider*" component. It can consume an <strong>$errors</strong> array from the validation output and surface information back to the user</p>
        <p>Pass in <strong>$errors</strong> directly, or optionally check if <strong>$invalid</strong> and set a custom <code>:error-text</code> message yourself.</p>
        <z-field
          v-for="(field, key, index) in form"
          v-if="index < 3"
          :key="'field-' + key"
          :label="key"
          :errors="field.$errors"
          :hint-text="'Type in a ' + key"
        >
          <input v-model="field.$model" />
        </z-field>

        <h4 class="mt-3">errors</h4>
        <ul>
          <li v-for="e in form.$errors" class="color-error">{{ e.$property +': ' + e.$message }}</li>
        </ul>
      </div>
    `,
  }));


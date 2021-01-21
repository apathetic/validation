import Vue from 'vue';
import { shallowMount, mount } from '@vue/test-utils';
import * as fixtures from '@test/fixtures/validation';
import useValidation from '@/composables/validation';



describe.skip('Validation composable', () => {
  let vm;

  beforeEach(() => {
    vm = shallowMount(component, {
      localVue,
      // ...options,
    });

    const useDemoValidation = () => useValidation(schema, values);
  });


  it('should return a reactive `form` object, and `use` helpers', () => {});

  it('sets internal validations from a `schema`', () => {});

  describe('setErrors', () => {});
  // it can consume errors in the JSON Error format
  // it can inject errors _dynamically_ into the form object

  describe('setValues', () => {});
  it('can consume `values` asynchronously', () => {});

  describe('$dirty', () => {});
  it('sets $dirty to `true` after an interaction', () => {
    //     expect(vm.$validation.dirty).toEqual(false);
    //     vm.foo = 'new val';
    //     expect(vm.$validation.dirty).toEqual(true);
    //   });
  });

  describe('$invalid', () => {});
  // sets invalid if the validator fn returns

  describe('$error', () => {});
  // returns true if both dirty and invalid are true

  describe('$errors', () => {});
  // collects all form errors from form fields
  // $errors are reactive

  describe('$model', () => {});
  // sets up a model from a value
  // updates original value if $model is updated ??????

  describe('$validator', () => {});
  // it passes in correct context to the valditor fn
  // returns the result
});

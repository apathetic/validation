import { r as required$1, m as minLength, e as email$1, s as sameAs } from './validators.bundle.js';
import 'https://unpkg.com/vue@3.0.4/dist/vue.esm-browser.prod.js';

const values = {
    username: 'horace',
    email: 'H@race.com',
    password: 'xxxx',
    samePassword: 'xxxxx',
    quantity: 99,
    seniority: '',
    accomplishment: [
        { name: 'Ate lunch', id: '1' },
        { name: 'Made a div', id: '2' },
    ],
};
const schema = {
    username: {
        required: required$1,
        minLength: minLength(3),
    },
    email: {
        required: required$1,
        email: email$1,
    },
    password: {
        required: required$1,
    },
    samePassword: {
        required: required$1,
        matches: sameAs('password'),
    },
    quantity: {
        required: required$1,
    },
    seniority: {
        required: required$1,
    },
    accomplishment: {
        custom: {
            $validator: (val) => val.id === '2',
            $message: 'The answer is div',
        },
    },
};
const formSchema = {
    username: {
        value: 'Horace',
        rules: {
            required: required$1,
            minLength: minLength(3),
        },
    },
    email: {
        value: 'H@race.com',
        rules: {
            required: required$1,
            email: email$1,
        },
    },
    password: {
        value: 'xxxxxx',
        rules: {
            required: required$1,
        },
    },
};

export { formSchema, schema, values };

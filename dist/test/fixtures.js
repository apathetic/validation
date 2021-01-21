import { required, email, minLength, sameAs } from '../validators';
export const values = {
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
export const schema = {
    username: {
        required,
        minLength: minLength(3),
    },
    email: {
        required,
        email,
    },
    password: {
        required,
    },
    samePassword: {
        required,
        matches: sameAs('password'),
    },
    quantity: {
        required,
    },
    seniority: {
        required,
    },
    accomplishment: {
        custom: {
            $validator: (val) => val.id === '2',
            $message: 'The answer is div',
        },
    },
};
export const formSchema = {
    username: {
        value: 'Horace',
        rules: {
            required,
            minLength: minLength(3),
        },
    },
    email: {
        value: 'H@race.com',
        rules: {
            required,
            email,
        },
    },
    password: {
        value: 'xxxxxx',
        rules: {
            required,
        },
    },
};

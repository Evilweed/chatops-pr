const path = require('path');
import { typescript } from '@betterer/typescript'

export default {
    'stricter typescript compilation': () =>
        typescript('tsconfig.json', {
            strict: true,
            noImplicitAny: true,
            strictNullChecks: true,
            strictFunctionTypes: true,
            strictPropertyInitialization: false,
            useDefineForClassFields: false,
        }).include(path.resolve(__dirname, 'src/**/*.ts')),
}

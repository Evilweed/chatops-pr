const path = require('path');
import { typescript } from '@betterer/typescript'

const pathToTypescriptFiles = 'src/**/*.ts'
const pathToTypescriptConfigFile = 'tsconfig.json'

const resolvedPathToTypescriptFiles = path.resolve(__dirname, pathToTypescriptFiles)
const resolvedPathToTypescriptConfigFile = path.resolve(__dirname, pathToTypescriptConfigFile)
console.log(resolvedPathToTypescriptFiles)

export default {
    'stricter typescript compilation': () =>
        typescript(resolvedPathToTypescriptConfigFile, {
            strict: true,
            noImplicitAny: true,
            strictNullChecks: true,
            strictFunctionTypes: true,
            strictPropertyInitialization: false,
            useDefineForClassFields: false,
        }).include(resolvedPathToTypescriptFiles),
}

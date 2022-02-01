const path = require('path');
import { typescript } from '@betterer/typescript'

const pathToTypescriptFiles = 'src/**/*.ts'         // <--- Adapt to your project needs
const pathToTypescriptConfigFile = 'tsconfig.json'  // <--- Adapt to your project needs

const resolvedPathToTypescriptFiles = path.resolve(__dirname, pathToTypescriptFiles)
const resolvedPathToTypescriptConfigFile = path.resolve(__dirname, pathToTypescriptConfigFile)

console.log(resolvedPathToTypescriptFiles)

export default {
    'stricter typescript compilation': () =>
        typescript(resolvedPathToTypescriptConfigFile, {
            strict: true,
            strictPropertyInitialization: false,
            useDefineForClassFields: false,
        }).include(resolvedPathToTypescriptFiles),
}

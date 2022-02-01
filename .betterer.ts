const path = require('path');
import { typescript } from '@betterer/typescript'

const pathsToTypescriptFilesUsedByTsConfig = ["./src/**/*.ts"]  // <--- Adapt to your project needs
const pathToTypescriptConfigFile = 'tsconfig.json'            // <--- Adapt to your project needs

const resolvedPathsToTypescriptFiles = pathsToTypescriptFilesUsedByTsConfig.map((globPath) => path.resolve(__dirname, globPath))
const resolvedPathToTypescriptConfigFile = path.resolve(__dirname, pathToTypescriptConfigFile)

console.log(resolvedPathsToTypescriptFiles)

export default {
    'stricter typescript compilation': () =>
        typescript(resolvedPathToTypescriptConfigFile, {
            strict: true,
            strictPropertyInitialization: false,
            useDefineForClassFields: false,
        }).include(resolvedPathsToTypescriptFiles),
}

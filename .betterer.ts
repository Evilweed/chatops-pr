import { typescript } from '@betterer/typescript'
import { tsquery } from '@betterer/tsquery'
import { regexp } from '@betterer/regexp'

export default {
    'stricter typescript compilation': () =>
        typescript('tsconfig.json', {
            strict: true,
            noImplicitAny: true,
            strictNullChecks: true,
            strictFunctionTypes: true,
            strictPropertyInitialization: false,
            useDefineForClassFields: false,
        }).include('./some-file-*.ts'),
    // 'no raw console.log': () =>
    //     tsquery('CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]').include(
    //         './**/*.ts'
    //     ),
    // 'no +2 params > pass object to function instead > function({email: "asd"}: SomeType)': () =>
    //     tsquery('FunctionDeclaration:has(Parameter + Parameter + Parameter)').include('./**/*.ts'),
    // 'no TODO without owner > please use //TODO(marcin) do something': () =>
    //     regexp(new RegExp('//TODO([^(][a-z]+[^)]|())', 'i')).include('./**/*.ts'),
}

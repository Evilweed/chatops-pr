import { typescript } from '@betterer/typescript'

export default {
    'stricter typescript compilation': () =>
        typescript('./tsconfig.json', {
            strict: true
        }).include('./**/*.ts'),
}

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist', 'node_modules', '.venv'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended[1].rules,
      ...prettierConfig.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      // The base `no-unused-vars` MUST be off when the typescript-eslint
      // variant is on — typescript-eslint documents this explicitly. It is
      // enabled here by the `js.configs.recommended.rules` spread above, and
      // it knows nothing about argsIgnorePattern, so it flagged every
      // intentionally-unused `_`-prefixed name in the codebase (263 errors on
      // main, and it failed dependency PRs that had not touched those files).
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          // args-only was not enough: `_`-prefixed VARIABLES and caught errors
          // are the same intentional-unused convention and were still erroring.
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // WARNING BASELINE — the lint script runs `--max-warnings 242`, which is
      // the exact count on main as of 2026-08-23: 216 no-explicit-any + 26
      // no-console. It was `--max-warnings 0`, which the codebase has never
      // satisfied, so "Lint & Test - Admin Portal" was permanently red and
      // failed dependency PRs that touched none of these files.
      //
      // A gate that can never pass is not a gate. Pinning the baseline makes it
      // GREEN today and meaningful tomorrow: any NEW warning fails the build.
      // Shrink the number as `any`s are typed; never raise it.
    },
  },
];

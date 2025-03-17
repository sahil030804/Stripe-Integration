const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  {
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'commonjs',

      globals: {
        // not check if set readonly
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      semi: ['error', 'always'], // give error when semi colon is not added at neded place and when fix then add semi colon automatic
      'semi-spacing': 'error', // give error where space before semicolon
      quotes: ['error', 'single'], // error where not used single quotes
      // 'no-undef': 'error', // give error where varibale is undefined [Default]
      // 'prefer-const': 'error', // give error when const required
      // 'no-unused-vars': [
      //   'warn',
      //   { argsIgnorePattern: 'req|req|next|models|Sequelize|DataTypes' },
      // ], // give error when variable is not used after defined and ignore variable which is mentioned above [Default]

      // "eqeqeq": 'error',	// give error where not used triple ===
      // indent: ['error', 2], // give error where 2 intend not added in block
      'object-shorthand': 'warn', // give warning where object can be shorthand like { key }
      'no-var': 'error', // give error where var is used
      'block-scoped-var': 'error', // give error where variable tries to call outside block
      // camelcase: ['error', { properties: 'always' }], // give error where variable is not camecase
      'no-use-before-define': 'error', // give error when variable is used before define
      // 'consistent-return': 'error', // give error where not used return but needed there
      'default-case': 'error', // give error where default case is not add in switch case
      'no-multiple-empty-lines': ['error', { max: 2 }], // give error where codee length is more then mentioned value
      // 'no-else-return': 'warn', // Avoid else after return
      'no-unmodified-loop-condition': 'error', // it givs error where loop goes to infinite loop
      'no-nested-ternary': 'warn', // Avoid complex nested ternary expressions
      'no-unneeded-ternary': 'warn', // Avoid using ternary when simpler expressions work
      // 'multiline-ternary': ['error', 'never'], // error when ternary operator written in multi line
      // 'no-useless-concat': 'error', // give error where unnecessary string concatenation. [Default]
      // 'no-useless-return': 'error', // give error where return not needed to be written [Default]
      'max-depth': ['warn', 4], // give warning where nested block exceed given range/levels
      'spaced-comment': ['error', 'always'], // give error when comment has no space at start
      // 'no-empty-function': 'error', // give error where empty function created [ Default ]
      'keyword-spacing': 'error', // give error if there is no space after keyword like if,else,for etc..
      // 'no-mixed-operators': 'error', // give error when multiple operator using in one variable without parantheses
      'arrow-spacing': 'error', // give error when no space around arrow function
      'no-confusing-arrow': 'error', // error when invalid arrow function syntax
      // 'no-duplicate-imports': 'error', // error when import same module more then 1 time [ Default ]
      'no-shadow': 'error', // error when main parameter name set to other place in block
      'for-direction': 'error', // error when for loop goes to infite loop
    },
  },
]);

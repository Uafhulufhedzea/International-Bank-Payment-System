// ESLint Security Configuration
// This config uses eslint-plugin-security to automatically detect
// security vulnerabilities in the code during development and
// in the CI/CD pipeline. It flags dangerous patterns like:
//   - eval() usage (code injection risk)
//   - Non-literal file system access (path traversal)
//   - Object injection vulnerabilities
const security = require("eslint-plugin-security");

module.exports = [
    {
        files: ["**/*.js"],
        ignores: ["node_modules/**"],
        plugins: {
            security: security
        },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                require: "readonly",
                module: "readonly",
                exports: "readonly",
                process: "readonly",
                __dirname: "readonly",
                console: "readonly"
            }
        },
        rules: {
            "no-eval": "error",                               // Blocks eval() - prevents code injection
            "no-implied-eval": "error",                       // Blocks implied eval (setTimeout with strings)
            "security/detect-object-injection": "warn",       // Warns about object injection risks
            "security/detect-non-literal-fs-filename": "warn",// Warns about dynamic file paths
            "security/detect-possible-timing-attacks": "warn",// Warns about timing attack vulnerabilities
            "security/detect-non-literal-require": "warn"     // Warns about dynamic require() calls
        }
    }
];

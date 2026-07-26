# finance-math

# @alex-dev-makarov/finance-math

A shared TypeScript utility package containing core financial calculations. Designed to be a single source of truth for both frontend and backend applications.

## Prerequisites

This package is hosted in a private GitHub Packages registry. To install it, your project needs a `.npmrc` file configured with a read-only authentication token.

1. Create a `.npmrc` file in the root of your consuming project.
2. **Crucial:** Ensure `.npmrc` is added to your project's `.gitignore` to prevent exposing tokens.
3. Add the following lines to your `.npmrc` file:

```text
//[npm.pkg.github.com/:_authToken=YOUR_SERVICE_READ_TOKEN](https://npm.pkg.github.com/:_authToken=YOUR_SERVICE_READ_TOKEN)
@alex-dev-makarov:registry=[https://npm.pkg.github.com/](https://npm.pkg.github.com/)
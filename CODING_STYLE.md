# Coding Style Guide

This project follows the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html ).

## JavaScript Conventions

### Naming Conventions
- **Variables and Functions**: Use `camelCase`
- **Classes**: Use `PascalCase`
- **Constants**: Use `UPPER_CASE` with underscores

### Code Formatting
- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for strings (`'hello'`)
- **Semicolons**: Required at the end of statements
- **Braces**: Always use braces for control structures

## HTML Conventions
- Use semantic HTML5 elements
- Lowercase tag names and attributes
- Use double quotes for attribute values

## CSS Conventions
- Use kebab-case for class names
- Order properties alphabetically or by category
- One selector per line for multiple selectors

## ESLint Configuration

This project uses ESLint to enforce coding standards. Configuration is in `.eslintrc.json`.

### Running ESLint
```bash
npx eslint *.js --quiet

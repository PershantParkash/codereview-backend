export class LanguageSpecificPrompts {
  static getLanguageContext(language: string): string {
    const contexts = {
      javascript: `
**JAVASCRIPT INDUSTRY STANDARDS:**
- Use camelCase for variables and functions
- Use PascalCase for classes and constructors  
- Prefer const/let over var
- Use arrow functions where appropriate
- Include proper error handling with try-catch
- Add JSDoc comments for functions
- Avoid global variables
- Use strict mode
- Follow ESLint recommended rules
`,
      typescript: `
**TYPESCRIPT INDUSTRY STANDARDS:**
- Define explicit types for all parameters and returns
- Use interfaces for object shapes
- Utilize union types and generics appropriately
- Enable strict mode in tsconfig
- Avoid 'any' type unless absolutely necessary
- Use proper access modifiers (private, public, protected)
- Follow TSLint/ESLint TypeScript rules
`,
      python: `
**PYTHON INDUSTRY STANDARDS (PEP 8):**
- Use snake_case for variables and functions
- Use PascalCase for classes
- Limit lines to 79 characters
- Use proper docstrings for functions and classes
- Include type hints for parameters and returns
- Handle exceptions properly with try-except
- Follow import organization standards
- Use list comprehensions where appropriate
`,
      java: `
**JAVA INDUSTRY STANDARDS:**
- Use PascalCase for class names
- Use camelCase for method and variable names
- Use UPPER_CASE for constants
- Include proper Javadoc comments
- Follow single responsibility principle
- Use proper exception handling
- Include access modifiers appropriately
`,
      csharp: `
**C# INDUSTRY STANDARDS:**
- Use PascalCase for class names and public members
- Use camelCase for private fields and local variables
- Include XML documentation comments
- Use proper exception handling
- Follow Microsoft naming conventions
- Use properties instead of public fields
`,
    };

    return contexts[language.toLowerCase()] || `
**GENERAL CODING STANDARDS:**
- Use clear, descriptive variable names
- Keep functions small and focused
- Include proper error handling
- Add comments for complex logic
- Follow consistent formatting
- Avoid code duplication
- Use appropriate data structures
`;
  }
}
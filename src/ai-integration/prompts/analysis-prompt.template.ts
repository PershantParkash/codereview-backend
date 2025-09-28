export class AnalysisPromptTemplate {
  static generatePrompt(code: string, language: string): string {
    return `
You are a senior software engineer and code reviewer. Analyze the following ${language} code and provide a comprehensive review following industry standards.

**CODE TO ANALYZE:**
\`\`\`${language}
${code}
\`\`\`

**ANALYSIS REQUIREMENTS:**
1. Identify issues categorized as: ERROR (critical problems), WARNING (potential issues), INFO (improvements)
2. Focus on: naming conventions, error handling, performance, security, maintainability, documentation
3. Provide line numbers for each issue
4. Generate an improved version of the code
5. Include explanations for why each change matters

**OUTPUT FORMAT (STRICT JSON):**
{
  "detectedLanguage": "${language}",
  "issues": [
    {
      "type": "error|warning|info",
      "title": "Brief issue title",
      "description": "Detailed explanation with industry standard reference",
      "line": number,
      "column": number,
      "severity": "high|medium|low",
      "rule": "rule-name-slug",
      "example": "How to fix this issue"
    }
  ],
  "improvedCode": "Complete improved version of the code with all fixes applied",
  "score": number_from_0_to_100,
  "suggestions": [
    "Overall suggestion 1",
    "Overall suggestion 2"
  ],
  "explanation": "Brief summary of main improvements made"
}

**IMPORTANT RULES:**
- Return ONLY valid JSON, no markdown or extra text
- Include line numbers starting from 1
- Ensure improved code is complete and functional
- Score based on code quality (100 = perfect, 0 = many issues)
- Focus on industry standards for ${language}
`;
  }
}
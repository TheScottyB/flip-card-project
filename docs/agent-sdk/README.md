# Agent SDK Interactive Documentation

This directory contains MDX-based documentation for the Agent SDK with interactive examples that demonstrate functionality directly in the documentation.

## Key Features

- **Interactive Examples**: Try the Agent SDK directly in the documentation
- **Modular Documentation**: Organized into logical sections
- **Multiple Implementation Examples**: OpenAI, Anthropic, and local rule-based options
- **Customizable**: All examples can be modified in real-time

## Getting Started

### Running Locally

1. Install dependencies:
   ```bash
   cd docs/agent-sdk
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open your browser to http://localhost:3000

### Building for Production

To build a static version of the documentation:

```bash
npm run build
npm run export
```

The static files will be available in the `out` directory.

## Directory Structure

- `index.mdx`: Main entry point and table of contents
- `overview.mdx`: Introduction and core concepts
- `architecture.mdx`: Detailed architecture explanation
- `implementation-options.mdx`: Different implementation approaches
- `integration-guide.mdx`: How to integrate with existing systems
- `examples/`: Implementation examples
  - `openai-implementation.mdx`: OpenAI-specific implementation
  - `other-implementations.mdx`: Alternative implementations

## How It Works

The interactive examples are powered by React components embedded in MDX. The key component is `AgentDemo`, which provides a simulated Agent SDK environment directly in the browser.

### Technologies Used

- **MDX**: Markdown with JSX for interactive content
- **React**: Component-based UI
- **Next.js**: Development environment and static site generation
- **CSS-in-JS**: Styling with styled-jsx

## GitBook Integration

This documentation can also be integrated with GitBook for a professional documentation portal. The `setup.js` file contains the necessary code to make the interactive components work within GitBook.

## Customizing

To add new examples or modify existing ones:

1. Create a new `.mdx` file in the appropriate directory
2. Import and use the `AgentDemo` component with your custom configuration
3. Add any additional explanatory text or code samples

## Troubleshooting

If the interactive components don't render correctly:

1. Check the browser console for errors
2. Ensure all dependencies are installed
3. Verify that the component props are valid

## License

This documentation and code examples are licensed under the same terms as the main project.
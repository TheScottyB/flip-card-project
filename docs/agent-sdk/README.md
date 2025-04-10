# Agent SDK Interactive Documentation

> ## 🚨 IMPORTANT: What We Mean By "Agent"
> 
> The Agent SDK represents a fundamental rethinking of how agentic applications are built and orchestrated. It is **not**:
> - A wrapper around the OpenAI Assistants API or Chat API
> - A simple function-calling implementation
> - A basic RAG pipeline with some orchestration
>
> Instead, the Agent SDK is a comprehensive framework for building truly agentic applications with:
> - Model-agnostic architecture that works with any AI provider or local implementation
> - Full control over agent behavior, capabilities and execution flow
> - Sophisticated state management and context handling
> - Built-in error handling and fallback strategies
> - Hybrid execution environments (client/server/edge)
>
> When discussing "agents" in this project, we always mean this comprehensive, model-agnostic approach rather than any specific vendor implementation.

## Quick Reference

```bash
# Working with documentation
├── docs/agent-sdk/*.md     # Edit these first (base content)
└── docs/agent-sdk/*.mdx    # Then sync to these (interactive)

# Example workflow
1. Edit overview.md
2. Copy changes to overview.mdx
3. Test interactive features
4. Commit both files
```

## ⚠️ IMPORTANT: Dual Documentation System

This documentation is maintained in two parallel formats that must be kept synchronized:

1. **Standard Markdown (.md)**
   - Located in: `docs/agent-sdk/*.md`
   - Purpose: Basic documentation, GitHub viewing
   - Edit when: Updating content only
   - Requirements: None (standard markdown)
   - Primary audience: GitHub users, basic documentation readers

2. **Interactive MDX (.mdx)**
   - Located in: `docs/agent-sdk/*.mdx`
   - Purpose: Interactive documentation, live examples
   - Edit when: Updating content or interactive features
   - Requirements: Node.js, npm (see setup below)
   - Primary audience: Users of the interactive documentation site

## Documentation Features

- **Interactive Examples**: Try the Agent SDK directly in the documentation
- **Modular Documentation**: Organized into logical sections
- **Multiple Implementation Examples**: OpenAI, Anthropic, and local rule-based options
- **Customizable**: All examples can be modified in real-time

## Directory Structure

### Markdown Documentation (.md)
- `index.md`: Main entry point and navigation
- `overview.md`: Introduction and core concepts
- `architecture.md`: Detailed architecture explanation
- `implementation-options.md`: Different implementation approaches
- `integration-guide.md`: How to integrate with existing systems
- `examples/`
  - `openai-implementation.md`: OpenAI-specific implementation
  - `other-implementations.md`: Alternative implementations

### Interactive Documentation (.mdx)
Currently available:
- `index.mdx`: Interactive entry point
- `overview.mdx`: Interactive introduction
- `examples/`
  - `openai-implementation.mdx`: Interactive OpenAI examples
  - `other-implementations.mdx`: Interactive alternative examples

### Current MDX Coverage Status

✓ Available MDX Files:
- `index.mdx`: Interactive landing page
- `overview.mdx`: Interactive introduction
- `examples/openai-implementation.mdx`: Interactive OpenAI examples
- `examples/other-implementations.mdx`: Interactive alternative implementations

🚧 Planned MDX Files (Coming Soon):
- `architecture.mdx`: Interactive architecture diagrams and examples
- `implementation-options.mdx`: Interactive implementation comparisons
- `integration-guide.mdx`: Interactive setup wizard

Note: All documentation content is available in the standard markdown (.md) files. MDX versions are being added incrementally to provide interactive features where they add the most value.

## Development and Maintenance

### Getting Started

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

### Version Control and Synchronization

#### Version Management
- Documentation follows semantic versioning (vX.Y.Z)
- Version numbers in .md and .mdx files should match
- Version updates require changes to both file types

#### Synchronization Tools

We provide tools to help maintain consistency:

```bash
# Check for content drift between .md and .mdx files
npm run check-docs

# Synchronize content (preserving interactive components)
npm run sync-docs

# Validate all documentation links
npm run validate-docs
```

Example usage:
```bash
# Before committing changes
npm run check-docs    # Verify .md and .mdx consistency
npm run validate-docs # Check all links and references
git status           # Review changes
```

### Development Workflow

1. **Making Content Changes**
   Example workflow:
   ```bash
   # 1. Edit .md file
   vim docs/agent-sdk/overview.md
   
   # 2. Sync content to .mdx
   # (Ensure only content is copied, preserve interactive components)
   
   # 3. Test changes
   npm run dev
   # Visit http://localhost:3000/overview
   
   # 4. Commit both files
   git add docs/agent-sdk/overview.md docs/agent-sdk/overview.mdx
   git commit -m "docs: update overview content"
   ```
   
   - Always edit the .md file first
   - Copy content changes to the corresponding .mdx file
   - Preserve interactive components in .mdx files
   - Test both versions

2. **Adding New Features**
   - Add new React components in `components/`
   - Update .mdx files to use new components
   - Document component usage in README

3. **Testing Changes**
   - Run interactive documentation locally
   - Verify content in both .md and .mdx versions
   - Test all interactive features
   - Check mobile responsiveness

### Automation Tips

1. **Git Hooks**
   ```bash
   # .git/hooks/pre-commit
   #!/bin/sh
   npm run check-docs
   npm run validate-docs
   ```

2. **VS Code Settings**
   ```json
   {
     "files.associations": {
       "*.mdx": "markdown"
     },
     "editor.codeActionsOnSave": {
       "source.fixAll.markdownlint": true
     }
   }
   ```

3. **CI/CD Integration**
   - Documentation checks run on pull requests
   - Version numbers validated automatically
   - Link checking in CI pipeline

## Technical Details

### Interactive Components

The interactive examples are powered by React components embedded in MDX:

#### Core Components
- `AgentDemo`: Provides a simulated Agent SDK environment
- `CodePreview`: Interactive code editor with live preview
- `ConfigurationBuilder`: Interactive configuration tool

#### Technologies Used
- **MDX**: Markdown with JSX for interactive content
- **React**: Component-based UI
- **Next.js**: Development environment and static site generation
- **CSS-in-JS**: Styling with styled-jsx

### Building for Production

To build a static version of the documentation:

```bash
npm run build
npm run export
```

The static files will be available in the `out` directory.

### GitBook Integration

This documentation can also be integrated with GitBook for a professional documentation portal. The `setup.js` file contains the necessary code to make the interactive components work within GitBook.

### Customizing

To add new examples or modify existing ones:

1. Create a new `.mdx` file in the appropriate directory
2. Import and use the `AgentDemo` component with your custom configuration
3. Add any additional explanatory text or code samples

## Troubleshooting

### Interactive Components
1. Check the browser console for errors
2. Ensure all dependencies are installed
3. Verify that component props are valid
4. Clear the Next.js cache if needed

### Content Synchronization
1. Use diff tools to verify .md and .mdx content matches
2. Check section headings and structure
3. Validate all links work in both versions
4. Ensure interactive features don't break content flow

## License

This documentation and code examples are licensed under the same terms as the main project.

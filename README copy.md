# Contact Card Viewer

This is a simple setup to view the React TSX component standalone.

## How to View the Component

1. **Open the index.html file in a web browser**
   - Simply double-click the `index.html` file to open it in your default browser
   - Or right-click and select "Open with" to choose a specific browser

2. **Alternative Method: Using a Local Server**
   If you have Node.js installed, you can run a local server:
   
   ```bash
   # Using npx (included with Node.js)
   npx serve .
   
   # Or install serve globally
   npm install -g serve
   serve .
   ```

3. **Using VS Code Live Server**
   - If you use Visual Studio Code, you can install the "Live Server" extension
   - Right-click on index.html and select "Open with Live Server"

## Files Included

- `index.html` - The HTML file that loads React, Tailwind CSS, and renders the component
- `contact-card-accurate.tsx` - The original TSX component (for reference, not used directly)

## Notes

- This viewer uses CDN versions of React, ReactDOM, Babel, and Tailwind CSS
- The component is embedded directly in the HTML for simplicity
- In a real application, you would typically use a build process with tools like webpack, Vite, or Create React App

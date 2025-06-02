# Sakah V2.0.2

This project is a web application being built with Vite, React, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework/Library:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Setup in progress)

## Folder Structure

The project follows a feature-oriented structure within the `src` directory:

```
src/
├── assets/         # Static assets like images, fonts
├── components/     # Reusable UI components
│   ├── common/     # Generic components (Button, Input, etc.)
│   └── layout/     # Layout components (Navbar, Footer, etc.)
├── constants/      # Application-wide constants
├── contexts/       # React Context API providers/consumers
├── features/       # Domain-specific modules
├── hooks/          # Custom React hooks
├── pages/          # Top-level route components
├── routes/         # Route configuration
├── services/       # API interaction logic
├── styles/         # Global styles, Tailwind base
├── types/          # TypeScript interfaces and type definitions
├── utils/          # Utility functions
├── App.css         # Main app styles (to be integrated with Tailwind)
├── App.tsx         # Main application component
├── index.css       # Entry CSS file (for Tailwind directives)
├── main.tsx        # Application entry point
└── vite-env.d.ts   # Vite TypeScript environment types
```

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Current Status & Known Issues

- **NPM Installation:** We are currently experiencing issues with `npm install` not correctly creating the `node_modules` directory and its contents. This is preventing the full setup of dependencies, including Tailwind CSS.
- **Tailwind CSS Setup:** Consequently, Tailwind CSS is not yet fully initialized. The `tailwind.config.js` and `postcss.config.js` files are missing, and Tailwind directives have not been added to `src/index.css`.

These issues need to be resolved to proceed with development effectively.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
// eslint.config.js
import tseslint from 'typescript-eslint';

export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import tseslint from 'typescript-eslint';
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
# sakah_v2.0.2

# QR Scanner - Mobile Web App# React + TypeScript + Vite

A mobile-optimized QR code scanning web application built with React, TypeScript, Vite, and TailwindCSS.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## FeaturesCurrently, two official plugins are available:

- 📱 **Mobile-First Design**: Optimized specifically for mobile devices- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- 📷 **Real-time QR Scanning**: Continuous scanning using device camera- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- 🎯 **Auto-Detection**: Automatically detects and processes QR codes

- 🔄 **API Integration**: Makes API calls with scanned QR data## React Compiler

- 📊 **Scan History**: View recent scan results with status indicators

- 🎨 **Modern UI**: Beautiful gradient design with smooth animationsThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- ⚡ **Fast Performance**: Built with Vite for optimal speed

## Expanding the ESLint configuration

## Technology Stack

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- **React 19** - UI framework

- **TypeScript** - Type safety```js

- **Vite** - Build tool and dev serverexport default defineConfig([

- **TailwindCSS 4** - Utility-first CSS framework globalIgnores(['dist']),

- **qr-scanner** - QR code scanning library {

  files: ['**/*.{ts,tsx}'],

## Getting Started extends: [

      // Other configs...

### Prerequisites

      // Remove tseslint.configs.recommended and replace with this

- Node.js 18+ installed tseslint.configs.recommendedTypeChecked,

- A device with a camera (mobile phone or webcam) // Alternatively, use this for stricter rules

      tseslint.configs.strictTypeChecked,

### Installation // Optionally, add this for stylistic rules

      tseslint.configs.stylisticTypeChecked,

1. Install dependencies:

````bash // Other configs...

npm install    ],

```    languageOptions: {

      parserOptions: {

2. Start the development server:        project: ['./tsconfig.node.json', './tsconfig.app.json'],

```bash        tsconfigRootDir: import.meta.dirname,

npm run dev      },

```      // other options...

    },

3. Open the app in your browser (preferably on a mobile device):  },

```])

http://localhost:5173```

````

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

### Usage

````js

1. **Allow Camera Access**: When prompted, allow the app to access your camera// eslint.config.js

2. **Start Scanning**: Click the "Start Scanning" buttonimport reactX from 'eslint-plugin-react-x'

3. **Scan QR Code**: Point your camera at a QR codeimport reactDom from 'eslint-plugin-react-dom'

4. **Auto-Process**: The app will automatically detect and process the QR code

5. **Stop Scanning**: Click "Stop Scanning" when doneexport default defineConfig([

  globalIgnores(['dist']),

## Configuration  {

    files: ['**/*.{ts,tsx}'],

### API Endpoint    extends: [

      // Other configs...

Update the API endpoint in `src/App.tsx`:      // Enable lint rules for React

      reactX.configs['recommended-typescript'],

```typescript      // Enable lint rules for React DOM

const response = await fetch('https://api.example.com/scan', {      reactDom.configs.recommended,

  method: 'POST',    ],

  headers: {    languageOptions: {

    'Content-Type': 'application/json',      parserOptions: {

  },        project: ['./tsconfig.node.json', './tsconfig.app.json'],

  body: JSON.stringify({        tsconfigRootDir: import.meta.dirname,

    qrCode: qrData,      },

    timestamp: new Date().toISOString(),      // other options...

  }),    },

});  },

```])

````

Replace `https://api.example.com/scan` with your actual API endpoint.

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
qr-scanner/
├── src/
│   ├── components/
│   │   └── QRScanner.tsx      # Main QR scanner component
│   ├── App.tsx                 # Main app with API integration
│   ├── main.tsx                # App entry point
│   └── index.css               # Global styles with Tailwind
├── public/                     # Static assets
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## Camera Permissions

The app requires camera access to scan QR codes. Make sure to:

- Allow camera permissions when prompted
- Use HTTPS in production (required for camera access)
- Test on actual mobile devices for best results

## Browser Compatibility

Works best on:

- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+
- Firefox Mobile 88+

## Troubleshooting

### Camera not working?

- Check browser permissions
- Ensure you're using HTTPS (required for camera access)
- Try a different browser
- Check if camera is being used by another app

### QR code not detecting?

- Ensure good lighting
- Hold the QR code steady
- Try adjusting the distance from camera
- Make sure the QR code is not damaged or blurry

## License

MIT

## Author

Built with ❤️ using Vite + React + TypeScript + TailwindCSS

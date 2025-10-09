# QR Scanner - Mobile Web App

## Project Information

This is a mobile-optimized QR code scanning web application built with:

- **React 19** with TypeScript
- **Vite 7** as the build tool
- **TailwindCSS 4** for styling
- **qr-scanner** library for QR code detection

## Features Implemented

✅ Mobile-first responsive design
✅ Real-time QR code scanning with device camera
✅ Start/Stop scanning controls
✅ Automatic QR code detection
✅ API integration for scanned data
✅ Scan history with status indicators
✅ Modern gradient UI with animations
✅ Camera permission handling
✅ Error handling and user feedback

## Project Structure

- `src/components/QRScanner.tsx` - Main QR scanner component with camera controls
- `src/App.tsx` - App container with API integration and scan history
- `src/index.css` - Global styles and mobile optimizations
- `index.html` - Mobile-optimized HTML template

## Development

The development server is running at http://localhost:5173/

To test the app:

1. Open the URL on a mobile device or use browser dev tools mobile emulation
2. Allow camera permissions when prompted
3. Click "Start Scanning" to begin
4. Point camera at a QR code
5. The app will automatically detect and process the QR code

## API Integration

The app makes POST requests to an API endpoint when a QR code is scanned. Update the endpoint in `src/App.tsx`:

```typescript
const response = await fetch("https://api.example.com/scan", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    qrCode: qrData,
    timestamp: new Date().toISOString(),
  }),
});
```

## Notes

- The app is optimized for mobile devices only
- Camera access requires HTTPS in production
- Test on actual mobile devices for best results
- Node.js 22.12+ or 20.19+ recommended (current: 22.11.0 works with warnings)

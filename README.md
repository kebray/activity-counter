# Activity Counter

A Progressive Web App (PWA) for tracking activity completion counts. Works offline and can be installed on Android and iOS devices.

## Features

- **Create Activities** - Set up activities with optional goals (upper limits)
- **Quick Increment** - One-tap to increment your activity count
- **Progress Tracking** - Visual progress bars showing completion percentage
- **Entry History** - Review past entries with timestamps and notes
- **Offline Support** - Works without internet connection
- **Installable** - Add to home screen on mobile devices

## Tech Stack

- React 19 + TypeScript
- Vite with PWA plugin
- Tailwind CSS
- Dexie.js (IndexedDB wrapper)
- React Router

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This app is configured for deployment on Netlify. Simply connect your repository to Netlify and it will automatically build and deploy.

The `netlify.toml` file is already configured with:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirects for client-side routing

## Installing as an App

### Android
1. Open the app in Chrome
2. Tap the "Add to Home Screen" prompt, or
3. Open Chrome menu → "Install app"

### iOS
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

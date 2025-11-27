# Mobile Editor

A React-based editor application that is bundled and embedded in a Flutter app's webview to provide rich text editing capabilities for Plane's mobile application.

## Overview

This package contains a standalone React application built with TypeScript and Vite that serves as the editor interface for Plane's mobile app. The app is compiled into static assets and loaded within a Flutter webview, enabling seamless integration between the web-based editor and native mobile functionality.

## Architecture

### Core Components

- **React Application**: Built with React 18 and TypeScript
- **Editor Engine**: Powered by `@plane/editor` package
- **Build System**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for responsive mobile-first design
- **Native Bridge**: Flutter InAppWebView for communication with native code

### Editor Variants

The application supports multiple editor variants based on use case:

1. **Document Editor** (`document`): Full collaborative document editor with real-time features
2. **Rich Text Editor** (`rich`): Feature-rich editor with formatting options
3. **Lite Text Editor** (`lite`): Simplified editor for basic text input
4. **Sticky Editor** (`sticky`): Minimal editor for quick notes and comments

## Flutter Integration

### Communication Bridge

The app communicates with the Flutter native layer through the `flutter_inappwebview` bridge:

```typescript
// Native calls from React to Flutter
const callNative = async (method: string, args?: string) =>
  await window.flutter_inappwebview?.callHandler(method, args);

// Flutter calls to React through global functions
window.setEditorVariant = (variant: string) => { ... };
window.executeAction = (actionKey: TEditorCommands) => { ... };
```

## Development

### Local Development

1. **Install Dependencies**:

   ```bash
   yarn install
   ```

2. **Start Development Server**:

   ```bash
   yarn dev
   ```

3. **Access the Editor**:
   ```bash
   http://localhost:[port]
   ```

### Development Editor

The package includes a development version that works independently of Flutter:

- **Standalone Testing**: Test editor functionality without Flutter app
- **Mock Data**: Uses predefined mock data for initialization
- **Console Logging**: Actions are logged to console instead of sent to native

### Configuration

Mock data for development can be modified in the dev editor component:

```typescript
const MOCK_DEV_PARAMS: TDocumentEditorParams = {
  editable: true,
  isSelfHosted: false,
  pageId: "dev-page-id",
  documentType: "page",
  workspaceSlug: "dev-workspace",
  projectId: "dev-project-id",
  userId: "dev-user-id",
  userDisplayName: "Dev User",
  cookie: "",
  liveServerUrl: "https://app.plane.so",
  liveServerBasePath: "/api",
};
```

## Build Process

### Production Build

```bash
yarn build
```

This creates optimized static assets in the `out` directory that can be embedded in the Flutter app.

### Integration with Flutter

1. **Build Assets**: The React app is built into static HTML, CSS, and JS files
2. **Embed in Flutter**: Flutter app loads these assets in a webview
3. **Bridge Setup**: Communication bridge is established between webview and native code
4. **Runtime Communication**: Bidirectional communication enables seamless integration

## Project Structure

```
packages/mobile-editor/
├── src/
│   ├── components/          # React components
│   │   ├── document-editor/  # Document editor components
│   │   ├── editor/          # Editor wrapper components
│   │   ├── mentions/        # Mention components
│   │   └── embed/           # Embed components
│   ├── constants/           # Application constants
│   ├── helpers/             # Utility functions
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── store/               # State management
│   └── extensions/          # Custom editor extensions
├── public/                  # Static assets
├── vite.config.mjs         # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## Usage in Flutter App

The mobile editor is designed to be embedded in a Flutter app webview with the following integration pattern:

1. **Flutter loads the built HTML file** in a webview
2. **Native bridge is established** for communication
3. **Editor variant is set** based on the use case
4. **Initial parameters are passed** from Flutter to React
5. **Real-time communication** enables seamless user experience

This architecture allows Plane to leverage web-based rich text editing capabilities while maintaining native mobile app performance and user experience.

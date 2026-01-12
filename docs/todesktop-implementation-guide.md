# ToDesktop Implementation Guide for Plane Desktop Application

This guide provides a comprehensive walkthrough for converting the Plane web application into a cross-platform desktop application using [ToDesktop Builder](https://www.todesktop.com/).

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Getting Started with ToDesktop Builder](#getting-started-with-todesktop-builder)
4. [Configuration Options](#configuration-options)
5. [Implementing Tabs](#implementing-tabs)
6. [Multi-Window Support](#multi-window-support)
7. [Inter-Window Communication](#inter-window-communication)
8. [Browser Controls & Navigation](#browser-controls--navigation)
9. [Native API Integration](#native-api-integration)
10. [CLI Setup for Automated Builds](#cli-setup-for-automated-builds)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Overview

ToDesktop Builder converts web applications into native desktop apps for macOS, Windows, and Linux. It uses Electron under the hood but abstracts away most of the complexity, allowing you to create desktop apps without extensive Electron knowledge.

### Key Benefits

- **No-code builder interface** for rapid prototyping
- **Native functionality** via JavaScript APIs
- **Auto-updates** built-in
- **Code signing** handled automatically
- **Cross-platform** support (Mac, Windows, Linux)
- **Plugin ecosystem** for extended functionality

---

## Prerequisites

- Node.js 22+ (matches Plane requirements)
- ToDesktop Builder application installed on your machine
- A ToDesktop account (free tier available for local development)
- Plane web application running locally or deployed

---

## Getting Started with ToDesktop Builder

### Step 1: Install ToDesktop Builder

1. Download the installer from [todesktop.com](https://www.todesktop.com/)
2. Install and launch the application
3. Create an account through the browser-based signup flow
4. Complete the onboarding wizard

### Step 2: Create Your First Desktop App

1. In ToDesktop Builder, click **"Create New App"**
2. Select **"Simple Window"** for the initial setup
3. Enter your Plane web app URL:
   - **Local development**: `http://localhost:3000`
   - **Production**: Your deployed Plane instance URL
4. Configure basic app settings:
   - **App Name**: `Plane`
   - **App Icon**: Use the Plane logo
   - **Window Dimensions**: Recommended `1280x800` minimum

### Step 3: Initial Configuration

In the ToDesktop Builder UI, configure the following sections:

#### Application Settings

| Setting           | Recommended Value          |
| ----------------- | -------------------------- |
| App Title         | Plane                      |
| Launch on Startup | Optional (user preference) |
| Offline Support   | Enabled                    |
| Window Frame      | Native                     |

#### Window Configuration

| Setting        | Value                                |
| -------------- | ------------------------------------ |
| Width          | 1280                                 |
| Height         | 800                                  |
| Min Width      | 800                                  |
| Min Height     | 600                                  |
| Resizable      | Yes                                  |
| Titlebar Style | Default (or `hiddenInset` for macOS) |

---

## Configuration Options

### todesktop.json Configuration

For advanced users integrating with CI/CD pipelines, create a `todesktop.json` in the project root:

```json
{
  "$schema": "https://unpkg.com/@todesktop/cli@latest/schemas/schema.json",
  "schemaVersion": 1,
  "id": "YOUR_TODESKTOP_APP_ID",
  "icon": "./public/plane-logo.png",
  "appId": "so.plane.desktop",
  "packageJson": {
    "name": "plane-desktop",
    "productName": "Plane",
    "version": "1.0.0",
    "author": "Plane <hello@plane.so>"
  }
}
```

### Staging Configuration

Create `todesktop.staging.json` for staging builds:

```json
{
  "extends": "./todesktop.json",
  "id": "YOUR_STAGING_APP_ID",
  "appId": "so.plane.desktop.staging",
  "icon": "./public/plane-logo-staging.png",
  "packageJson": {
    "name": "plane-desktop-staging",
    "productName": "Plane (Staging)"
  }
}
```

---

## Implementing Tabs

ToDesktop supports native tabs on macOS. This feature allows users to manage multiple Plane workspaces in a single window.

### Checking Tab Support

Tabs are only supported on macOS. Check for support before implementing:

```typescript
// src/lib/desktop/tabs.ts
import { nativeWindow } from "@todesktop/client-core";

export async function initializeTabs() {
  // Check if running in ToDesktop environment
  if (!window.todesktop) {
    console.log("Not running in ToDesktop environment");
    return;
  }

  const tabsSupported = await nativeWindow.areTabsSupported();

  if (tabsSupported) {
    console.log("Tabs are supported on this platform");
    setupTabHandlers();
  } else {
    console.log("Tabs not supported - using standard window management");
  }
}
```

### Creating New Tabs

```typescript
// src/lib/desktop/tabs.ts
import { nativeWindow } from "@todesktop/client-core";

export async function createNewTab() {
  if (!window.todesktop) return;

  const tabsSupported = await nativeWindow.areTabsSupported();

  if (tabsSupported) {
    // Creates a new tab with the pre-defined app URL
    await nativeWindow.createNewTab();
  } else {
    // Fallback: create a new window instead
    await createNewWindow();
  }
}

async function createNewWindow() {
  await nativeWindow.create({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
  });
}
```

### Tab-Aware Navigation

When implementing workspace switching, consider tab behavior:

```typescript
// src/lib/desktop/workspace-tabs.ts
import { nativeWindow } from "@todesktop/client-core";

export async function openWorkspaceInNewTab(workspaceSlug: string) {
  if (!window.todesktop) {
    // Web fallback - open in new browser tab
    window.open(`/${workspaceSlug}`, "_blank");
    return;
  }

  const tabsSupported = await nativeWindow.areTabsSupported();

  if (tabsSupported) {
    // Create new tab and navigate to workspace
    await nativeWindow.createNewTab();
    // The new tab will load the app URL, then we navigate
    // Use IPC or BroadcastChannel to coordinate navigation
  } else {
    // Create new window for the workspace
    const windowRef = await nativeWindow.create({
      width: 1280,
      height: 800,
    });
    // Navigate the new window to the workspace
  }
}
```

### Keyboard Shortcuts for Tabs

Register keyboard shortcuts for tab management:

```typescript
// src/lib/desktop/shortcuts.ts
export function registerTabShortcuts() {
  if (!window.todesktop) return;

  // These are typically handled by the OS on macOS
  // but you can add custom shortcuts for cross-platform support
  document.addEventListener("keydown", async (e) => {
    // Cmd/Ctrl + T for new tab
    if ((e.metaKey || e.ctrlKey) && e.key === "t") {
      e.preventDefault();
      await createNewTab();
    }

    // Cmd/Ctrl + W to close current tab/window
    if ((e.metaKey || e.ctrlKey) && e.key === "w") {
      e.preventDefault();
      await nativeWindow.close();
    }
  });
}
```

---

## Multi-Window Support

ToDesktop supports creating and managing multiple windows for different views.

### Creating Additional Windows

```typescript
// src/lib/desktop/windows.ts
import { nativeWindow, views } from "@todesktop/client-core";

interface WindowOptions {
  url?: string;
  width?: number;
  height?: number;
  title?: string;
}

export async function createWindow(options: WindowOptions = {}) {
  const { width = 1280, height = 800, title = "Plane" } = options;

  const windowRef = await nativeWindow.create({
    width,
    height,
    minWidth: 800,
    minHeight: 600,
    title,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  return windowRef;
}
```

### Creating Windows with BrowserViews

For more complex layouts (like split views), use BrowserViews:

```typescript
// src/lib/desktop/browser-views.ts
import { nativeWindow, views } from "@todesktop/client-core";

export async function createSplitView(windowRef: string, leftUrl: string, rightUrl: string) {
  // Create left view
  const leftViewRef = await views.create({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Create right view
  const rightViewRef = await views.create({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Add views to window
  await nativeWindow.addBrowserView({
    ref: windowRef,
    viewRef: leftViewRef,
  });

  await nativeWindow.addBrowserView({
    ref: windowRef,
    viewRef: rightViewRef,
  });

  // Set bounds for split layout (50/50)
  const windowSize = await nativeWindow.getSize({ ref: windowRef });

  await views.setBounds({
    ref: leftViewRef,
    bounds: {
      x: 0,
      y: 0,
      width: windowSize[0] / 2,
      height: windowSize[1],
    },
  });

  await views.setBounds({
    ref: rightViewRef,
    bounds: {
      x: windowSize[0] / 2,
      y: 0,
      width: windowSize[0] / 2,
      height: windowSize[1],
    },
  });

  // Enable auto-resize
  await views.setAutoResize({
    ref: leftViewRef,
    dimensions: { width: true, height: true, horizontal: false, vertical: false },
  });

  await views.setAutoResize({
    ref: rightViewRef,
    dimensions: { width: true, height: true, horizontal: true, vertical: false },
  });

  return { leftViewRef, rightViewRef };
}
```

---

## Inter-Window Communication

ToDesktop provides two methods for communication between windows.

### Using BroadcastChannel API (Same Origin)

For windows sharing the same origin (recommended for Plane):

```typescript
// src/lib/desktop/broadcast.ts

type MessageType = "workspace:changed" | "issue:updated" | "notification:received" | "theme:changed";

interface BroadcastMessage<T = unknown> {
  type: MessageType;
  payload: T;
  timestamp: number;
  sourceWindowId?: string;
}

class DesktopBroadcast {
  private channel: BroadcastChannel;
  private listeners: Map<MessageType, Set<(payload: unknown) => void>>;

  constructor(channelName: string = "plane-desktop") {
    this.channel = new BroadcastChannel(channelName);
    this.listeners = new Map();

    this.channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const { type, payload } = event.data;
      const typeListeners = this.listeners.get(type);

      if (typeListeners) {
        typeListeners.forEach((callback) => callback(payload));
      }
    };
  }

  publish<T>(type: MessageType, payload: T) {
    const message: BroadcastMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };
    this.channel.postMessage(message);
  }

  subscribe<T>(type: MessageType, callback: (payload: T) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback as (payload: unknown) => void);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(callback as (payload: unknown) => void);
    };
  }

  destroy() {
    this.channel.close();
    this.listeners.clear();
  }
}

export const desktopBroadcast = new DesktopBroadcast();
```

### Using ToDesktop IPC (Cross-Domain)

For windows with different domains, use the IPC plugin:

```bash
npm install @todesktop/client-ipc
```

```typescript
// src/lib/desktop/ipc.ts
import { publish, subscribe } from "@todesktop/client-ipc";

export async function sendToAllWindows(channel: string, data: unknown) {
  await publish(channel, data);
}

export function listenForMessages(channel: string, callback: (data: unknown) => void) {
  return subscribe(channel, callback);
}

// Usage example
export function setupIPCListeners() {
  // Listen for workspace changes from other windows
  listenForMessages("workspace:selected", (data) => {
    console.log("Workspace selected in another window:", data);
  });

  // Listen for focus requests
  listenForMessages("window:focus", async (data: { windowId: string }) => {
    const currentWindowId = await nativeWindow.getId();
    if (data.windowId === currentWindowId) {
      await nativeWindow.focus();
    }
  });
}
```

---

## Browser Controls & Navigation

Desktop apps don't have browser navigation by default. Implement custom controls if needed.

### Adding Navigation Buttons

```typescript
// src/components/desktop/NavigationControls.tsx
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

export function NavigationControls() {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    if (!window.todesktop) return;

    const updateNavigationState = async () => {
      const webContents = window.todesktop.contents;
      setCanGoBack(await webContents.canGoBack());
      setCanGoForward(await webContents.canGoForward());
    };

    // Update on navigation events
    window.todesktop.contents.on("navigate", updateNavigationState);
    updateNavigationState();

    return () => {
      window.todesktop.contents.off("navigate", updateNavigationState);
    };
  }, []);

  // Don't render in web browser
  if (!window.todesktop) return null;

  const handleBack = () => window.todesktop?.contents.goBack();
  const handleForward = () => window.todesktop?.contents.goForward();
  const handleReload = () => window.location.reload();

  return (
    <div className="flex items-center gap-1 px-2">
      <button
        onClick={handleBack}
        disabled={!canGoBack}
        className="p-1 rounded hover:bg-custom-background-80 disabled:opacity-50"
        title="Go Back"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={handleForward}
        disabled={!canGoForward}
        className="p-1 rounded hover:bg-custom-background-80 disabled:opacity-50"
        title="Go Forward"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <button onClick={handleReload} className="p-1 rounded hover:bg-custom-background-80" title="Reload">
        <RotateCw className="h-4 w-4" />
      </button>
    </div>
  );
}
```

### CSS for Desktop-Only Elements

Show navigation controls only in the desktop app:

```css
/* src/styles/desktop.css */

/* Hide by default (web) */
.desktop-only {
  display: none;
}

/* Show only in ToDesktop environment */
.todesktop .desktop-only {
  display: flex;
}

/* Adjust for traffic lights on macOS */
.todesktop.darwin .titlebar-drag-region {
  padding-left: 78px; /* Space for window controls */
}
```

Apply the `.todesktop` class to the root element:

```typescript
// src/lib/desktop/init.ts
export function initDesktopEnvironment() {
  if (window.todesktop) {
    document.documentElement.classList.add("todesktop");

    // Detect platform
    const platform = window.todesktop.platform;
    document.documentElement.classList.add(platform); // 'darwin', 'win32', 'linux'
  }
}
```

---

## Native API Integration

### Installing the Client API

```bash
npm install @todesktop/client-core
```

### System Notifications

```typescript
// src/lib/desktop/notifications.ts
export async function showDesktopNotification(
  title: string,
  body: string,
  options?: {
    onClick?: () => void;
  }
) {
  if (!window.todesktop) {
    // Fallback to web notifications
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
    return;
  }

  // Use native notifications via ToDesktop
  const notification = new Notification(title, {
    body,
    silent: false,
  });

  if (options?.onClick) {
    notification.onclick = options.onClick;
  }
}
```

### App Badge (macOS Dock / Windows Taskbar)

```typescript
// src/lib/desktop/badge.ts
import { app } from "@todesktop/client-core";

export async function updateBadgeCount(count: number) {
  if (!window.todesktop) return;

  if (count > 0) {
    await app.setBadgeCount(count);
  } else {
    await app.setBadgeCount(0); // Removes badge
  }
}

// Usage: Show unread notification count
export function useBadgeSync() {
  useEffect(() => {
    const unsubscribe = notificationStore.subscribe((state) => {
      updateBadgeCount(state.unreadCount);
    });
    return unsubscribe;
  }, []);
}
```

### System Tray

```typescript
// src/lib/desktop/tray.ts
import { tray, nativeWindow } from "@todesktop/client-core";

export async function setupSystemTray() {
  if (!window.todesktop) return;

  // Tray is configured in ToDesktop Builder UI
  // But you can interact with it programmatically

  // Example: Update tray tooltip
  await tray.setToolTip("Plane - Project Management");
}
```

### Deep Links

Handle custom URL schemes (e.g., `plane://`):

```typescript
// src/lib/desktop/deeplinks.ts
export function setupDeepLinkHandler() {
  if (!window.todesktop) return;

  window.todesktop.on("open-url", (url: string) => {
    // Parse the deep link URL
    const parsed = new URL(url);

    // Handle different paths
    if (parsed.pathname.startsWith("/issue/")) {
      const issueId = parsed.pathname.replace("/issue/", "");
      navigateToIssue(issueId);
    } else if (parsed.pathname.startsWith("/workspace/")) {
      const workspaceSlug = parsed.pathname.replace("/workspace/", "");
      navigateToWorkspace(workspaceSlug);
    }
  });
}
```

---

## CLI Setup for Automated Builds

### Installation

```bash
# Global installation
npm install -g @todesktop/cli

# Or as dev dependency (recommended for CI/CD)
pnpm add -D @todesktop/cli
```

### Package.json Scripts

Add these scripts to `apps/web/package.json`:

```json
{
  "scripts": {
    "desktop:build": "todesktop build",
    "desktop:build:staging": "todesktop build --config todesktop.staging.json",
    "desktop:release": "todesktop release",
    "desktop:release:staging": "todesktop release --config todesktop.staging.json"
  }
}
```

### Runtime Package

Install the runtime for auto-updates and crash reporting:

```bash
pnpm add @todesktop/runtime
```

Initialize in your app's entry point:

```typescript
// src/main.tsx or src/index.tsx
import { todesktop } from "@todesktop/runtime";

// Initialize ToDesktop runtime (must be called early)
if (window.todesktop) {
  todesktop.init();
}
```

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
# .github/workflows/desktop-release.yml
name: Desktop Release

on:
  push:
    tags:
      - "desktop-v*"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 10.24.0

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"

      - run: pnpm install

      - name: Build Desktop App
        env:
          TODESKTOP_EMAIL: ${{ secrets.TODESKTOP_EMAIL }}
          TODESKTOP_ACCESS_TOKEN: ${{ secrets.TODESKTOP_ACCESS_TOKEN }}
        run: |
          pnpm --filter=web desktop:release
```

---

## Best Practices

### 1. Feature Detection

Always check for ToDesktop environment before using desktop APIs:

```typescript
export function isDesktopApp(): boolean {
  return typeof window !== "undefined" && !!window.todesktop;
}

export function isMacOS(): boolean {
  return isDesktopApp() && window.todesktop?.platform === "darwin";
}

export function isWindows(): boolean {
  return isDesktopApp() && window.todesktop?.platform === "win32";
}
```

### 2. Graceful Degradation

Ensure your app works both as a web app and desktop app:

```typescript
export async function copyToClipboard(text: string) {
  if (window.todesktop) {
    // Use native clipboard API
    await window.todesktop.clipboard.writeText(text);
  } else {
    // Fallback to web API
    await navigator.clipboard.writeText(text);
  }
}
```

### 3. Platform-Specific Styling

Account for platform differences:

```typescript
// src/hooks/useDesktopPlatform.ts
export function useDesktopPlatform() {
  const [platform, setPlatform] = useState<string | null>(null);

  useEffect(() => {
    if (window.todesktop) {
      setPlatform(window.todesktop.platform);
    }
  }, []);

  return {
    isDesktop: !!platform,
    isMac: platform === "darwin",
    isWindows: platform === "win32",
    isLinux: platform === "linux",
  };
}
```

### 4. Keyboard Shortcuts

Use platform-appropriate modifier keys:

```typescript
export function getPlatformModifier(): string {
  if (window.todesktop?.platform === "darwin") {
    return "⌘"; // Command key on Mac
  }
  return "Ctrl";
}

// Display: "⌘+K" on Mac, "Ctrl+K" on Windows/Linux
```

### 5. Window State Persistence

Save and restore window positions:

```typescript
// ToDesktop Builder handles this automatically when configured
// But you can also manage it programmatically for custom windows
```

---

## Troubleshooting

### Common Issues

#### 1. API Not Available

**Problem**: `window.todesktop is undefined`

**Solution**: The code is running in a web browser, not the desktop app. Always check for the ToDesktop environment:

```typescript
if (window.todesktop) {
  // Desktop-specific code
}
```

#### 2. Tabs Not Working

**Problem**: `createNewTab()` has no effect

**Solution**: Tabs are only supported on macOS. Check support first:

```typescript
const tabsSupported = await nativeWindow.areTabsSupported();
```

#### 3. IPC Messages Not Received

**Problem**: Messages between windows aren't being received

**Solution**:

- Ensure both windows have the IPC plugin enabled
- Verify the channel names match exactly
- Check that the IPC client library is installed in both contexts

#### 4. Build Failures

**Problem**: `todesktop build` fails

**Solution**:

- Verify `todesktop.json` has the correct app ID
- Ensure you're logged in: `todesktop login`
- Check that required fields are present (icon, author)

### Debug Mode

Enable verbose logging:

```typescript
if (window.todesktop) {
  console.log("ToDesktop Version:", window.todesktop.version);
  console.log("Platform:", window.todesktop.platform);
  console.log("App ID:", window.todesktop.appId);
}
```

---

## TypeScript Definitions

Add type definitions for ToDesktop APIs:

```typescript
// src/types/todesktop.d.ts
declare global {
  interface Window {
    todesktop?: {
      version: string;
      platform: "darwin" | "win32" | "linux";
      appId: string;
      contents: {
        goBack(): Promise<void>;
        goForward(): Promise<void>;
        canGoBack(): Promise<boolean>;
        canGoForward(): Promise<boolean>;
        on(event: string, callback: () => void): void;
        off(event: string, callback: () => void): void;
      };
      clipboard: {
        writeText(text: string): Promise<void>;
        readText(): Promise<string>;
      };
      on(event: string, callback: (...args: unknown[]) => void): void;
    };
  }
}

export {};
```

---

## Resources

- [ToDesktop Documentation](https://www.todesktop.com/docs/introduction/getting-started)
- [ToDesktop Builder Basics](https://www.todesktop.com/docs/introduction/basics)
- [ToDesktop API Reference](https://www.todesktop.com/docs/API/client-core.nativewindow)
- [Multi-Window Tutorial](https://www.todesktop.com/docs/tutorials/multi-window-todomvc)
- [Inter-Window Communication](https://www.todesktop.com/docs/windows/communicating-between-windows)
- [ToDesktop CLI (npm)](https://www.npmjs.com/package/@todesktop/cli)
- [GitHub Quick Start](https://github.com/ToDesktop/todesktop-quick-start)

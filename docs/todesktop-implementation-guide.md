# ToDesktop Implementation Guide for Plane Desktop Application

This guide provides a comprehensive walkthrough for converting the Plane web application into a cross-platform desktop application using [ToDesktop Builder](https://www.todesktop.com/).

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Getting Started with ToDesktop Builder](#getting-started-with-todesktop-builder)
4. [Self-Hosted Support](#self-hosted-support)
5. [Configuration Options](#configuration-options)
6. [Implementing Tabs](#implementing-tabs)
7. [Multi-Window Support](#multi-window-support)
8. [Inter-Window Communication](#inter-window-communication)
9. [Browser Controls & Navigation](#browser-controls--navigation)
10. [Native API Integration](#native-api-integration)
11. [CLI Setup for Automated Builds](#cli-setup-for-automated-builds)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

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

## Self-Hosted Support

Plane supports both cloud-hosted (`app.plane.so`) and self-hosted deployments. On first launch, the desktop application prompts users to select their deployment type and configure the appropriate endpoint.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    First Launch Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌─────────────────┐    ┌────────────┐ │
│  │ Setup Screen │───▶│  Cloud Selected │───▶│ app.plane  │ │
│  │              │    │                 │    │   .so      │ │
│  │ Cloud or     │    └─────────────────┘    └────────────┘ │
│  │ Self-hosted? │                                          │
│  │              │    ┌─────────────────┐    ┌────────────┐ │
│  │              │───▶│ Self-hosted     │───▶│ Custom URL │ │
│  └──────────────┘    │ URL Input       │    │            │ │
│                      └─────────────────┘    └────────────┘ │
│                                                              │
│  Configuration stored in electron-store / localStorage       │
└─────────────────────────────────────────────────────────────┘
```

### Configuration Storage

Store the instance configuration using Electron's persistent storage:

```typescript
// src/lib/desktop/instance-config.ts

export interface InstanceConfig {
  type: "cloud" | "self-hosted";
  endpoint: string;
  configuredAt: number;
}

const CLOUD_ENDPOINT = "https://app.plane.so";
const CONFIG_KEY = "plane-instance-config";

/**
 * Get the stored instance configuration
 */
export function getInstanceConfig(): InstanceConfig | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(CONFIG_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as InstanceConfig;
  } catch {
    return null;
  }
}

/**
 * Save instance configuration
 */
export function saveInstanceConfig(config: InstanceConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

/**
 * Clear instance configuration (for reset/logout)
 */
export function clearInstanceConfig(): void {
  localStorage.removeItem(CONFIG_KEY);
}

/**
 * Check if instance is configured
 */
export function isInstanceConfigured(): boolean {
  return getInstanceConfig() !== null;
}

/**
 * Get the API endpoint based on configuration
 */
export function getApiEndpoint(): string {
  const config = getInstanceConfig();
  if (!config) return CLOUD_ENDPOINT;
  return config.endpoint;
}

/**
 * Configure cloud instance
 */
export function configureCloudInstance(): InstanceConfig {
  const config: InstanceConfig = {
    type: "cloud",
    endpoint: CLOUD_ENDPOINT,
    configuredAt: Date.now(),
  };
  saveInstanceConfig(config);
  return config;
}

/**
 * Configure self-hosted instance
 */
export function configureSelfHostedInstance(endpoint: string): InstanceConfig {
  // Normalize the endpoint URL
  let normalizedEndpoint = endpoint.trim();
  if (!normalizedEndpoint.startsWith("http")) {
    normalizedEndpoint = `https://${normalizedEndpoint}`;
  }
  // Remove trailing slash
  normalizedEndpoint = normalizedEndpoint.replace(/\/$/, "");

  const config: InstanceConfig = {
    type: "self-hosted",
    endpoint: normalizedEndpoint,
    configuredAt: Date.now(),
  };
  saveInstanceConfig(config);
  return config;
}
```

### Setup Screen Component

Create the first-launch setup screen:

```typescript
// src/components/desktop/InstanceSetup.tsx
import { useState } from "react";
import {
  configureCloudInstance,
  configureSelfHostedInstance,
  validateInstanceEndpoint,
} from "@/lib/desktop/instance-config";

type SetupStep = "choose" | "self-hosted-input" | "validating" | "complete";

interface InstanceSetupProps {
  onComplete: (endpoint: string) => void;
}

export function InstanceSetup({ onComplete }: InstanceSetupProps) {
  const [step, setStep] = useState<SetupStep>("choose");
  const [selfHostedUrl, setSelfHostedUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleCloudSelect = () => {
    const config = configureCloudInstance();
    onComplete(config.endpoint);
  };

  const handleSelfHostedSelect = () => {
    setStep("self-hosted-input");
  };

  const handleSelfHostedSubmit = async () => {
    if (!selfHostedUrl.trim()) {
      setError("Please enter your Plane instance URL");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Validate the endpoint
      const isValid = await validateInstanceEndpoint(selfHostedUrl);

      if (!isValid) {
        setError("Unable to connect to Plane instance. Please check the URL and try again.");
        setIsValidating(false);
        return;
      }

      const config = configureSelfHostedInstance(selfHostedUrl);
      onComplete(config.endpoint);
    } catch (err) {
      setError("Failed to validate instance. Please check your URL and network connection.");
      setIsValidating(false);
    }
  };

  const handleBack = () => {
    setStep("choose");
    setError(null);
    setSelfHostedUrl("");
  };

  // Choose deployment type screen
  if (step === "choose") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-custom-background-100">
        <div className="w-full max-w-md space-y-8 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <img src="/plane-logo.svg" alt="Plane" className="h-12 w-12" />
            <h1 className="mt-4 text-2xl font-semibold text-custom-text-100">Welcome to Plane</h1>
            <p className="mt-2 text-center text-custom-text-300">Choose how you want to connect to Plane</p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {/* Cloud Option */}
            <button
              onClick={handleCloudSelect}
              className="w-full rounded-lg border border-custom-border-200 p-4 text-left transition-colors hover:border-custom-primary-100 hover:bg-custom-background-80"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-custom-primary-100/10 p-2">
                  <CloudIcon className="h-6 w-6 text-custom-primary-100" />
                </div>
                <div>
                  <h3 className="font-medium text-custom-text-100">Plane Cloud</h3>
                  <p className="mt-1 text-sm text-custom-text-300">Connect to app.plane.so - Managed by Plane</p>
                </div>
              </div>
            </button>

            {/* Self-hosted Option */}
            <button
              onClick={handleSelfHostedSelect}
              className="w-full rounded-lg border border-custom-border-200 p-4 text-left transition-colors hover:border-custom-primary-100 hover:bg-custom-background-80"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-custom-primary-100/10 p-2">
                  <ServerIcon className="h-6 w-6 text-custom-primary-100" />
                </div>
                <div>
                  <h3 className="font-medium text-custom-text-100">Self-hosted</h3>
                  <p className="mt-1 text-sm text-custom-text-300">Connect to your own Plane instance</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Self-hosted URL input screen
  if (step === "self-hosted-input") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-custom-background-100">
        <div className="w-full max-w-md space-y-6 p-8">
          {/* Header */}
          <div className="flex flex-col items-center">
            <img src="/plane-logo.svg" alt="Plane" className="h-12 w-12" />
            <h1 className="mt-4 text-2xl font-semibold text-custom-text-100">Self-hosted Instance</h1>
            <p className="mt-2 text-center text-custom-text-300">Enter the URL of your Plane instance</p>
          </div>

          {/* URL Input */}
          <div className="space-y-4">
            <div>
              <label htmlFor="instance-url" className="block text-sm font-medium text-custom-text-200">
                Instance URL
              </label>
              <input
                id="instance-url"
                type="url"
                value={selfHostedUrl}
                onChange={(e) => setSelfHostedUrl(e.target.value)}
                placeholder="https://plane.yourcompany.com"
                className="mt-1 w-full rounded-md border border-custom-border-200 bg-custom-background-90 px-3 py-2 text-custom-text-100 placeholder:text-custom-text-400 focus:border-custom-primary-100 focus:outline-none focus:ring-1 focus:ring-custom-primary-100"
                disabled={isValidating}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSelfHostedSubmit();
                }}
              />
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                disabled={isValidating}
                className="flex-1 rounded-md border border-custom-border-200 px-4 py-2 text-custom-text-200 transition-colors hover:bg-custom-background-80 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSelfHostedSubmit}
                disabled={isValidating || !selfHostedUrl.trim()}
                className="flex-1 rounded-md bg-custom-primary-100 px-4 py-2 text-white transition-colors hover:bg-custom-primary-200 disabled:opacity-50"
              >
                {isValidating ? "Connecting..." : "Connect"}
              </button>
            </div>
          </div>

          {/* Help text */}
          <p className="text-center text-xs text-custom-text-400">
            Make sure your Plane instance is accessible from this device
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// Icon components
function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
    </svg>
  );
}

function ServerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
      />
    </svg>
  );
}
```

### Endpoint Validation

Validate that the provided endpoint is a valid Plane instance:

```typescript
// src/lib/desktop/instance-config.ts (continued)

/**
 * Validate that an endpoint is a valid Plane instance
 */
export async function validateInstanceEndpoint(endpoint: string): Promise<boolean> {
  try {
    // Normalize the endpoint
    let url = endpoint.trim();
    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }
    url = url.replace(/\/$/, "");

    // Try to reach the Plane API health endpoint
    const response = await fetch(`${url}/api/v1/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      // Short timeout for validation
      signal: AbortSignal.timeout(10000),
    });

    // Check if response indicates a Plane instance
    // Plane API typically returns a JSON response or redirects to auth
    if (response.ok || response.status === 401 || response.status === 403) {
      return true;
    }

    // Also try the instance config endpoint
    const configResponse = await fetch(`${url}/api/v1/instance/configurations/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    return configResponse.ok || configResponse.status === 401 || configResponse.status === 403;
  } catch (error) {
    console.error("Endpoint validation failed:", error);
    return false;
  }
}

/**
 * Check if the current instance is cloud-hosted
 */
export function isCloudInstance(): boolean {
  const config = getInstanceConfig();
  return config?.type === "cloud";
}

/**
 * Check if the current instance is self-hosted
 */
export function isSelfHostedInstance(): boolean {
  const config = getInstanceConfig();
  return config?.type === "self-hosted";
}
```

### App Entry Point Integration

Integrate the setup flow into the app's entry point:

```typescript
// src/App.tsx or src/main.tsx
import { useEffect, useState } from "react";
import { InstanceSetup } from "@/components/desktop/InstanceSetup";
import { isInstanceConfigured, getApiEndpoint } from "@/lib/desktop/instance-config";
import { isDesktopApp } from "@/lib/desktop/utils";

function App() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in a desktop environment
    if (isDesktopApp()) {
      const configured = isInstanceConfigured();
      setIsConfigured(configured);

      if (configured) {
        setEndpoint(getApiEndpoint());
      }
    } else {
      // Web environment - use default endpoint from env
      setIsConfigured(true);
      setEndpoint(process.env.NEXT_PUBLIC_API_BASE_URL || "");
    }
  }, []);

  // Loading state
  if (isConfigured === null) {
    return <LoadingScreen />;
  }

  // Show setup screen if not configured (desktop only)
  if (!isConfigured && isDesktopApp()) {
    return (
      <InstanceSetup
        onComplete={(configuredEndpoint) => {
          setEndpoint(configuredEndpoint);
          setIsConfigured(true);
          // Reload the app to apply new configuration
          window.location.reload();
        }}
      />
    );
  }

  // Render the main application
  return <MainApp endpoint={endpoint} />;
}
```

### API Client Configuration

Configure the API client to use the stored endpoint:

```typescript
// src/lib/api-client.ts
import axios from "axios";
import { getApiEndpoint } from "@/lib/desktop/instance-config";
import { isDesktopApp } from "@/lib/desktop/utils";

function getBaseUrl(): string {
  if (isDesktopApp()) {
    return getApiEndpoint();
  }
  // Web fallback - use environment variable
  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
}

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Re-configure API client when endpoint changes
export function reconfigureApiClient(): void {
  apiClient.defaults.baseURL = getBaseUrl();
}
```

### Switching Instances

Allow users to switch between instances from settings:

```typescript
// src/components/desktop/InstanceSettings.tsx
import { useState } from "react";
import { getInstanceConfig, clearInstanceConfig, InstanceConfig } from "@/lib/desktop/instance-config";
import { isDesktopApp } from "@/lib/desktop/utils";

export function InstanceSettings() {
  const [config, setConfig] = useState<InstanceConfig | null>(getInstanceConfig());

  // Only show in desktop app
  if (!isDesktopApp()) return null;

  const handleSwitchInstance = () => {
    // Clear current configuration
    clearInstanceConfig();
    // Reload to show setup screen
    window.location.reload();
  };

  return (
    <div className="rounded-lg border border-custom-border-200 p-4">
      <h3 className="text-lg font-medium text-custom-text-100">Instance Configuration</h3>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-custom-text-300">Type</span>
          <span className="text-sm font-medium text-custom-text-100">
            {config?.type === "cloud" ? "Plane Cloud" : "Self-hosted"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-custom-text-300">Endpoint</span>
          <span className="text-sm font-medium text-custom-text-100">{config?.endpoint}</span>
        </div>

        {config?.configuredAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-custom-text-300">Configured</span>
            <span className="text-sm text-custom-text-200">{new Date(config.configuredAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-custom-border-200 pt-4">
        <button
          onClick={handleSwitchInstance}
          className="w-full rounded-md border border-red-500 px-4 py-2 text-red-500 transition-colors hover:bg-red-500/10"
        >
          Switch Instance
        </button>
        <p className="mt-2 text-xs text-custom-text-400">
          This will sign you out and allow you to connect to a different Plane instance.
        </p>
      </div>
    </div>
  );
}
```

### Deep Link Support for Self-Hosted

Handle deep links that include the instance URL:

```typescript
// src/lib/desktop/deeplinks.ts
import { configureSelfHostedInstance, configureCloudInstance } from "./instance-config";

export function setupDeepLinkHandler() {
  if (!window.todesktop) return;

  window.todesktop.on("open-url", async (url: string) => {
    const parsed = new URL(url);

    // Handle instance configuration via deep link
    // Example: plane://configure?type=self-hosted&endpoint=https://plane.example.com
    if (parsed.pathname === "/configure" || parsed.pathname === "configure") {
      const type = parsed.searchParams.get("type");
      const endpoint = parsed.searchParams.get("endpoint");

      if (type === "cloud") {
        configureCloudInstance();
        window.location.reload();
      } else if (type === "self-hosted" && endpoint) {
        configureSelfHostedInstance(endpoint);
        window.location.reload();
      }
      return;
    }

    // Handle other deep links...
  });
}
```

### Multi-Instance Support (Advanced)

For power users who need to connect to multiple instances:

```typescript
// src/lib/desktop/multi-instance.ts

export interface SavedInstance {
  id: string;
  name: string;
  type: "cloud" | "self-hosted";
  endpoint: string;
  addedAt: number;
  lastUsed?: number;
}

const INSTANCES_KEY = "plane-saved-instances";
const ACTIVE_INSTANCE_KEY = "plane-active-instance";

/**
 * Get all saved instances
 */
export function getSavedInstances(): SavedInstance[] {
  const stored = localStorage.getItem(INSTANCES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Add a new instance
 */
export function addInstance(instance: Omit<SavedInstance, "id" | "addedAt">): SavedInstance {
  const instances = getSavedInstances();
  const newInstance: SavedInstance = {
    ...instance,
    id: crypto.randomUUID(),
    addedAt: Date.now(),
  };
  instances.push(newInstance);
  localStorage.setItem(INSTANCES_KEY, JSON.stringify(instances));
  return newInstance;
}

/**
 * Remove an instance
 */
export function removeInstance(id: string): void {
  const instances = getSavedInstances().filter((i) => i.id !== id);
  localStorage.setItem(INSTANCES_KEY, JSON.stringify(instances));
}

/**
 * Set active instance
 */
export function setActiveInstance(id: string): void {
  const instances = getSavedInstances();
  const instance = instances.find((i) => i.id === id);
  if (instance) {
    // Update last used timestamp
    instance.lastUsed = Date.now();
    localStorage.setItem(INSTANCES_KEY, JSON.stringify(instances));
    localStorage.setItem(ACTIVE_INSTANCE_KEY, id);
  }
}

/**
 * Get active instance
 */
export function getActiveInstance(): SavedInstance | null {
  const activeId = localStorage.getItem(ACTIVE_INSTANCE_KEY);
  if (!activeId) return null;
  return getSavedInstances().find((i) => i.id === activeId) || null;
}
```

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

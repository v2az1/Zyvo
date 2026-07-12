# Mailix – Modern Temporary Email App (by Zyvo)

Mailix is a fast, secure, privacy-focused temporary email application designed by **Zyvo** for Android and Web. Built with a responsive Material 3 interface, Mailix leverages the secure **Mail.tm API** to provide disposable email inboxes on demand. 

The application is highly optimized for performance on slow connections (3G/4G), low RAM devices, and budget smartphones, featuring robust offline message caches and dynamic English and Urdu (اردو) localization.

---

## Key Features

- **Instant Temporary Inboxes**: Generate secure, anonymous email accounts on demand with zero personal registration or phone validation.
- **Dynamic Domain Selectors**: Choose from multiple active system domains.
- **Account History & Switcher**: Keep a secure history of up to 15 previously created temporary addresses on your device and switch between them instantly.
- **Rich HTML Reader**: View beautifully designed newsletter and activation emails inside a sandboxed, tracking-free safe reader, or toggle to Plain-text mode.
- **Unread Counter & Notifications**: Native-compatible push alerts trigger immediately upon receiving new incoming mail.
- **AdMob Ready Architecture**: Modular AdMob layout integrations for Banner, Interstitial, and Rewarded ads.
- **Urdu Localization**: Fully localized experience for users in Pakistan (RTL Layout integration, tailored messaging).
- **Offline Caching**: All fetched email bodies, sender metadata, and attachments list cache locally, ensuring they can be read offline.

---

## Project Structure

```text
/
├── .github/workflows/       # GitHub Actions CI/CD workflows for Lint, Type Check, and AAB Signing
├── src/
│   ├── components/
│   │   ├── ThemeContext.tsx # Global settings, theme (Light/Dark/System), and translations
│   │   ├── SplashView.tsx   # Elegant boot splash screen with organic progressive loader
│   │   ├── WelcomeView.tsx  # Interactive onboarding, language switch cards
│   │   ├── HomeView.tsx     # Cockpit view with Copy, Customize Username, and AdMob dialogs
│   │   ├── InboxView.tsx    # List panel with live search and pull-to-refresh
│   │   ├── EmailDetailView.tsx # Dual HTML/Plain-text reading panel, copy & download helpers
│   │   ├── Navbar.tsx       # Bottom bar with active rounded pills and unread count badges
│   │   └── AdMobMock.tsx    # High-fidelity reusable AdMob integration suite (Banner/Interstitial/Rewarded)
│   ├── services/
│   │   ├── api.ts           # Resilient Mail.tm API wrapper with retry logic
│   │   ├── storage.ts       # Unified Capacitor Preferences & LocalStorage fallback cache
│   │   └── notifications.ts # Native Capacitor LocalNotifications & browser Notification triggers
│   ├── types.ts             # Strict TypeScript definitions for Domains, Messages, and Settings
│   ├── App.tsx              # Application shell router and background sync polling loops
│   ├── index.css            # Global typography styles (Inter & JetBrains Mono), custom scrollbars
│   └── main.tsx             # Application entry-point
├── package.json             # Scripts and external dependencies
├── vite.config.ts           # Vite build system config
└── tsconfig.json            # Strict TypeScript configuration
```

---

## Technical Specifications

- **Framework**: React 19 (Vite Build System)
- **Styling**: Tailwind CSS v4.0 (Custom Theme Extensions)
- **Runtime Bridge**: Capacitor JS (Android, iOS, Web)
- **Language**: TypeScript (Strict Typings)
- **API Clients**: Axios (Resilient networking, 15s Timeout, status interceptors)

---

## Setup & Local Development

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v18 or higher)
- npm (v9 or higher)
- Android Studio (for running and compiling Android builds)

### 2. Installation
Clone the repository and install all node packages:
```bash
npm install
```

### 3. Start Development Server
Boot up the fast local development server:
```bash
npm run dev
```
The application will run on `http://localhost:3000`.

---

## Capacitor & Android Integration Guide

Mailix uses **Capacitor** to bridge React static assets into Android native project resources.

### 1. Initialize Capacitor
If you need to reconfigure Capacitor within your workspace, run:
```bash
npm i @capacitor/core @capacitor/cli
npx cap init Mailix pk.zyvo.mailix --web-dir=dist
```

### 2. Add Android Platform Support
Install the native Android runtime bridge:
```bash
npm i @capacitor/android
npx cap add android
```

### 3. Sync Assets to Android Studio
Whenever you make changes to your React codebase, build your project and sync assets to Android:
```bash
# Build static React pages
npm run build

# Synchronize static /dist directory into Android native asset folders
npx cap sync
```

### 4. Compile & Run on Android Device
Launch Android Studio to run, debug, and test on a physical device or virtual emulator:
```bash
npx cap open android
```
Inside Android Studio, select your target device and click **Run**.

---

## Build & Release (APK / AAB Compilation)

### Debug APK Compilation
To quickly compile a debug `.apk` file for testing:
1. Open Android Studio (`npx cap open android`).
2. Navigate to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Once completed, retrieve the apk in `android/app/build/outputs/apk/debug/app-debug.apk`.

### Release AAB (Android App Bundle) Compilation
To compile a secure, production-ready, signed `.aab` file for publication on the Google Play Store:
1. Inside Android Studio, navigate to **Build > Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** and click **Next**.
3. Create or select your secure Keystore file (`.jks`), enter password credentials, and define key aliases.
4. Select build variant **release**, and click **Finish**.
5. Once completed, your signed AAB is located in `android/app/release/app-release.aab`.

---

## CI/CD Pipeline (GitHub Actions)

Mailix incorporates automated continuous integration workflows to enforce type safety, perform code linters, and generate signed Android App Bundles (.aab) automatically when pushing code.

Create a GitHub Actions configuration at `.github/workflows/build-pipeline.yml` (see pipeline definition below) to trigger these checks:

- **Linting & Verification Checks**: Runs on every pull request to ensure high code quality.
- **Signed Production Build**: Triggers on tag releases (e.g., `v*`) or merges to `main`. It compiles the web build, syncs Capacitor assets, uses Android SDK tools to compile, and signs your AAB dynamically using secure GitHub Repository Secrets.

### Required Secrets for GitHub Repository
To automate production release builds, configure the following secrets in your GitHub repository (**Settings > Secrets and variables > Actions**):

- `KEYSTORE_BASE64`: Base64 encoded string of your private `.jks` keystore file.
- `KEYSTORE_PASSWORD`: Password of your private keystore file.
- `KEY_ALIAS`: Alias of the signing key inside the keystore.
- `KEY_PASSWORD`: Password of the specific key alias.

---

## AdMob Configuration

To insert real AdMob ad unit IDs for production:
1. Open `/src/components/AdMobMock.tsx`.
2. Replace the demo placeholder IDs in `ADMOB_IDS` with your registered AdMob identifiers:
   - `BANNER`: Your native Android AdMob banner ID.
   - `INTERSTITIAL`: Your native Android Interstitial ID.
   - `REWARDED`: Your native Android Rewarded Video ID.

---

## License

This software is developed and maintained exclusively by **Zyvo Private Ltd**.
All proprietary designs, layouts, and localization matrices are registered trademarks of Zyvo.

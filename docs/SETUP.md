# Setup

Prerequisites, configuration, install, run commands, and deep links for both platforms.

## Prerequisites

- Node 22.23.1 — pinned in `.nvmrc`. If you use `nvm`, run `nvm use`.
- Xcode 26.5+ and CocoaPods 1.16+ for iOS.
- Android Studio (SDK, platform-tools, an emulator image) and a JDK 17 for Android. `JAVA_HOME` must point at a JDK 17 install (e.g. `brew install openjdk@17`).
- Ruby + Bundler for CocoaPods (`bundle install`).
- [Maestro CLI](https://maestro.mobile.dev) for the E2E suite — `curl -Ls "https://get.maestro.mobile.dev" | bash`.

## Configuration

Base URL is read from `react-native-config` and must never be hardcoded.

```sh
cp .env.example .env
```

`.env.example` defaults `API_BASE_URL` to the published deployment. `.env` is git-ignored — no secrets or machine-specific values are committed.

Crash reporting (`SENTRY_DSN`, `SENTRY_ENVIRONMENT`) is configured the same way. `SENTRY_DSN` is blank by default, which keeps crash reporting disabled locally — set it to a real DSN to enable it.

### Networking per target

- **iOS Simulator**: reaches the public API directly over `https`; no setup beyond the base URL.
- **Android emulator**: the emulator's virtual network reaches the public API directly over `https`; no host-mapping is needed for this deployment. (Only a machine-local server, addressed as `10.0.2.2`, would need special-casing — not the case here.)
- **Physical device**: same as the emulator, since the base URL is a public `https` endpoint rather than a machine-local server. iOS needs the device registered to a signing team in Xcode; Android needs USB debugging enabled and the device authorized (`adb devices` should list it).
  - Enable USB debugging: Settings → About phone → tap Build number 7x to unlock Developer Options → enable USB Debugging.
  - Connect via USB, accept the "Allow USB debugging?" prompt on the device, then confirm with `adb devices` (status must read `device`, not `unauthorized`).

## Install

```sh
npm install
bundle install                # once, for CocoaPods
(cd ios && bundle exec pod install)
```

## Run

```sh
npm run ios       # iOS Simulator
npm run android   # Android emulator (must be running first)
```

Physical device:

```sh
npx react-native run-ios --device "Your iPhone Name"
npm run android   # with one device authorized in `adb devices`, no flag needed
npx react-native run-android --device <adb-device-id>   # multiple devices/emulators attached
```

## Prebuilt Android APK

To try the app without a toolchain, install the APK from the
[latest release](https://github.com/sjunka/casa-de-maiz/releases/latest):

```sh
adb install casa-maiz-1.0.0-arm64.apk
```

arm64-v8a only, JS bundled into the binary, pointed at the published CMS. It is
signed with the React Native debug keystore, so Android warns about an unknown
developer. Verified installing and running on a physical Android device
(Redmi Note 8 Pro) — 2026-07-26. Rebuild it with:

```sh
(cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a)
```

Sentry's source-map upload only joins the build when `SENTRY_AUTH_TOKEN` is set,
so a release build needs no Sentry credentials — see
[Observability](OBSERVABILITY.md).

## Deep links

The app registers the `casamaiz://` scheme. Destinations match the CMS-published paths, e.g. `casamaiz://menu`, `casamaiz://legal/privacy_policy`, `casamaiz://reservas`.

```sh
# iOS Simulator
xcrun simctl openurl booted casamaiz://menu

# Android emulator/device
adb shell am start -W -a android.intent.action.VIEW -d "casamaiz://menu"
```

An unsupported path lands on Home; any other scheme is rejected.

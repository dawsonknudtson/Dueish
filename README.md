# Dueish

A focused three-screen onboarding for iOS, built with Expo, React Native, Expo Router, and strict TypeScript.

## Run

```sh
npm install
npm run ios
```

Use `npm run ios` to build, install, and launch the development app in the iOS simulator (requires Xcode). Use `npm run ios:device` to select a connected iPhone; physical devices require Apple signing. After installation, `npm run ios:start` starts Metro and opens the installed app without rebuilding. Use `npm run web` for a browser preview.

## Included

1. Enter the things you forget, or add suggestions. Remove items and prevent duplicates.
2. Select which items from your own list you want to track.
3. Choose daily, every three days, weekly, or no notifications.

White and light blue styling, native SF Pro on iOS, vector icons without emojis, keyboard-aware layout, scrollable content, accessible selection controls, and back navigation.

Choices are saved on Continue and completion using SQLite key-value storage on native devices and localStorage in the web preview. Completion opens a hard paywall; reopening checks RevenueCat access before showing the paid setup confirmation. The tracker home screen is intentionally outside this build.

After purchasing or restoring Dueish Pro, a reminder frequency requests notification permission and schedules one recurring local check-in. Denied permission still saves onboarding, with a clear status. Choosing no notifications cancels the onboarding check-in. The browser preview saves the preference but does not schedule notifications. These are general check-ins, not per-tracker due-date notifications.

## Validation

```sh
npm run typecheck
npx expo install --check
npx expo export --platform web --platform ios
```

Before shipping, verify on an iPhone: keyboard and small-screen scrolling, larger accessibility text, VoiceOver, back navigation, reopening after completion, and notification permission granted/denied. Confirm delivery with the app in the background using a temporary short interval in a development build.

Expo references: [SDK 57](https://docs.expo.dev/versions/v57.0.0/), [SQLite](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/), [notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/).

## Purchases

The paywall offers Monthly ($2.99), Yearly ($19.99), and Lifetime ($39.99), using localized store prices when configured. See [REVENUECAT.md](REVENUECAT.md) for the public SDK key, required store products and entitlement, and development-build instructions. Real purchases require a native build (`npm run ios:build`); Expo Go and web are previews only. Run `npm test` for the purchase-gate tests.

First launch always begins at onboarding question one, even if RevenueCat finds an existing purchase. Returning users reach the paywall only after completing the current onboarding flow with valid answers. Completion flags from earlier builds are treated as drafts: answers are preserved and onboarding begins at question one.

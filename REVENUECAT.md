# Dueish purchases

The custom hard paywall uses `react-native-purchases`. Saving the last onboarding answer immediately shows the paywall. There is no dismiss or skip action. A purchase or restore must return an active `dueish_pro` entitlement to unlock. Existing customers are checked at launch and whenever the app becomes active. No local boolean grants paid access.

The current post-purchase destination is a setup confirmation; the tracker home screen has not been built yet. Reminder permission and scheduling happen after access is granted.

## One-time store setup

An API key connects the SDK; it cannot create store products. In App Store Connect, use the bundle ID in `app.json` (`com.dueish.app`, or change it to your own everywhere), complete the paid-app agreements, and create:

| Suggested product ID | Type | US price | RevenueCat package |
| --- | --- | --- | --- |
| `dueish_monthly` | Auto-renewable subscription, 1 month | $2.99 | Monthly (`$rc_monthly`) |
| `dueish_yearly` | Auto-renewable subscription, 1 year | $19.99 | Annual (`$rc_annual`) |
| `dueish_lifetime` | Non-consumable purchase | $39.99 | Lifetime (`$rc_lifetime`) |

Place the two subscriptions in one subscription group. Lifetime is a non-consumable, not a subscription. Set prices in App Store Connect; the SDK does not set them. The paywall uses store-localized prices when available. The requested USD prices are visual placeholders only when products are unavailable; purchasing unavailable products is disabled.

In RevenueCat:

1. Create an Apple app and connect App Store Connect using RevenueCat's setup instructions.
2. Import the three products and attach all three to the entitlement **`dueish_pro`**.
3. Create an offering, assign those products to its standard Monthly, Annual, and Lifetime packages, and mark it as the **current** offering.
4. Copy the Apple **public SDK API key** (`appl_...`). Do not embed a RevenueCat secret API key or Apple credentials in this repository.

The product IDs above are suggestions; code resolves standard packages from the current offering. Only the entitlement name and package mapping need to match.

## Plug in the key

Copy `.env.example` to `.env.local` and fill in:

```dotenv
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_your_public_sdk_key
```

Restart Metro after changing environment variables. Set the same variable in your EAS build environment before producing a distributable build. Expo public variables are bundled into the app; this is appropriate for RevenueCat's public SDK key.

## Native build and testing

```sh
npm install
npm run ios:build
```

Or use the profiles in `eas.json` to build with EAS. A real development build or TestFlight build is required for purchase testing. Expo Go and the browser can preview the design but deliberately cannot purchase or unlock access. Production builds reject RevenueCat Test Store keys.

Validate with Apple's sandbox/TestFlight and your configured RevenueCat app:

- Buy each package; verify the correct store product and price, entitlement, and confirmation.
- Cancel the purchase sheet; stay on the paywall without an error.
- Restore a prior purchase after reinstall; verify access. Restore with no purchase must stay locked.
- Relaunch with active, expired, and revoked purchases. Verify entitlement updates lock expired/revoked customers.
- Test offline offering loads, pending/Ask to Buy transactions, retries, and denied notification permission.
- Verify a second purchase tap cannot start another transaction.

`npm test` covers the app gate and SDK interactions using mocks. It does not replace native store testing. Entitlements use RevenueCat's SDK cache/offline behavior; foreground refresh requests customer information through the SDK.

Before App Store submission, publish your final privacy policy and configure its URL in App Store Connect. The paywall includes an in-app privacy summary and Apple's standard EULA link. Review both against the final product, data practices, and your chosen license terms.

Sources: [RevenueCat Expo integration](https://www.revenuecat.com/docs/getting-started/installation/expo), [products and offerings](https://www.revenuecat.com/docs/getting-started/displaying-products), [restoring purchases](https://www.revenuecat.com/docs/getting-started/restoring-purchases).

## Local purchase simulation

For UI testing without Apple setup, RevenueCat products, or native purchases, put this in `.env.local` and restart Metro:

```dotenv
EXPO_PUBLIC_SIMULATE_PURCHASES=true
```

This works only with `__DEV__` enabled. The paywall shows a development simulation label and opens a clearly labeled local confirmation dialog. Confirm grants session-only preview access; Cancel stays on the paywall. The confirmation screen offers **Test another plan** to reset access. No SDK calls, charges, purchase records, or notification scheduling occur in simulation. Reloading resets simulated access, while onboarding answers remain saved.

Set the flag to `false` and restart Metro to test real purchases again. Release builds ignore the flag. This simulation tests the app flow, not StoreKit, RevenueCat products, receipts, or real restore behavior. The missing-native-module error is independent of Apple account setup; native integration still needs separate verification before shipping.

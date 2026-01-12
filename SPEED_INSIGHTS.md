# Getting started with Speed Insights

This guide will help you get started with using Vercel Speed Insights on your project, showing you how to enable it, add the package to your project, deploy your app to Vercel, and view your data in the dashboard.

To view instructions on using the Vercel Speed Insights in your project for your framework, use the **Choose a framework** dropdown on the right (at the bottom in mobile view).

## Prerequisites

- A Vercel account. If you don't have one, you can [sign up for free](https://vercel.com/signup).
- A Vercel project. If you don't have one, you can [create a new project](https://vercel.com/new).
- The Vercel CLI installed. If you don't have it, you can install it using the following command:
  ```bash
  pnpm i vercel
  ```
  Or with your preferred package manager:
  ```bash
  yarn i vercel
  # or
  npm i vercel
  # or
  bun i vercel
  ```

## Setup Steps

### 1. Enable Speed Insights in Vercel

On the [Vercel dashboard](/dashboard), select your Project followed by the **Speed Insights** tab. You can also select the button below to be taken there. Then, select **Enable** from the dialog.

> **💡 Note:** Enabling Speed Insights will add new routes (scoped at `/_vercel/speed-insights/*`) after your next deployment.

### 2. Add `@vercel/speed-insights` to your project

Using the package manager of your choice, add the `@vercel/speed-insights` package to your project:

```bash
pnpm i @vercel/speed-insights
```

Or with your preferred package manager:
```bash
yarn i @vercel/speed-insights
# or
npm i @vercel/speed-insights
# or
bun i @vercel/speed-insights
```

### 3. Add the `SpeedInsights` component to your app

For React/Expo projects with web support, add the `SpeedInsights` component to your main app file:

```jsx
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function App() {
  return (
    <>
      {/* Your app content */}
      {Platform.OS === 'web' && <SpeedInsights />}
    </>
  );
}
```

The component is conditionally rendered only for web platforms, as mobile platforms (iOS/Android) have different performance tracking mechanisms.

**Key Points:**
- The `SpeedInsights` component is a wrapper around the tracking script
- It provides seamless integration with React applications
- For web-only implementation, conditionally render it based on platform
- Import from `@vercel/speed-insights/react` for React/Expo projects

### 4. Deploy your app to Vercel

You can deploy your app to Vercel's global [CDN](/docs/cdn) by running the following command from your terminal:

```bash
vercel deploy
```

Alternatively, you can [connect your project's git repository](/docs/git#deploying-a-git-repository), which will enable Vercel to deploy your latest pushes and merges to main.

Once your app is deployed, it's ready to begin tracking performance metrics.

> **💡 Note:** If everything is set up correctly, you should be able to find the `/_vercel/speed-insights/script.js` script inside the body tag of your page.

### 5. View your data in the dashboard

Once your app is deployed, and users have visited your site, you can view the data in the dashboard.

To do so, go to your [dashboard](/dashboard), select your project, and click the **Speed Insights** tab.

After a few days of visitors, you'll be able to start exploring your metrics. For more information on how to use Speed Insights, see [Using Speed Insights](/docs/speed-insights/using-speed-insights).

## Privacy and Compliance

Learn more about how Vercel supports [privacy and data compliance standards](/docs/speed-insights/privacy-policy) with Vercel Speed Insights.

## Current Implementation in Speekly

The Speekly project has already integrated Speed Insights:

- **Package**: `@vercel/speed-insights` (v1.3.1) is included in `package.json`
- **Location**: `App.js` line 1165 imports and line 1287 uses the component
- **Implementation**: The `<SpeedInsights />` component is conditionally rendered for web platforms only:
  ```jsx
  {Platform.OS === 'web' && <SpeedInsights />}
  ```

This approach ensures that:
1. Speed Insights tracking only runs on web deployments
2. Mobile builds (iOS/Android) are not affected
3. The component integrates seamlessly with the Expo framework

## Next steps

Now that you have Vercel Speed Insights set up, you can explore the following topics to learn more:

- [Learn how to use the `@vercel/speed-insights` package](https://vercel.com/docs/speed-insights/package)
- [Learn about metrics](https://vercel.com/docs/speed-insights/metrics)
- [Read about privacy and compliance](https://vercel.com/docs/speed-insights/privacy-policy)
- [Explore pricing](https://vercel.com/docs/speed-insights/limits-and-pricing)
- [Troubleshooting](https://vercel.com/docs/speed-insights/troubleshooting)

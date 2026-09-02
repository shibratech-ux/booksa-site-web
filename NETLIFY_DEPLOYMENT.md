# Netlify Deployment

This project is ready for a Netlify preview or branch deployment.

## Build settings

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

## SPA routing

Client-side routes are handled by the redirect in `netlify.toml`, so direct page refreshes should continue to work after deployment.

## Environment variables

Copy `.env.example` into your Netlify environment and set the matching `VITE_*` values before enabling any production release.

## Required Netlify env vars

Set these in Netlify if you want the corresponding features to work:

- `VITE_API_BASE_URL`: your backend API base URL. If you leave it empty, the app falls back to mock data for some views and `/api` for the shared Axios client.
- `VITE_GOOGLE_MAPS_API_KEY`: a browser-restricted key with the Google Maps Embed API enabled.
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

If you are not using Firebase yet, you can leave the Firebase variables blank. The app will boot without initializing Firebase.

## Non-production rollout

To keep the site out of production for now, connect the repository as a Deploy Preview or branch deploy first, then leave the production publish step disabled until you are ready.

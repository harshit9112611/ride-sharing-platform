# Push Notifications

## Generate VAPID keys

Install the Web Push CLI, then generate a matching public/private key pair:

```bash
npx web-push generate-vapid-keys
```

Keep the private key secret. The frontend receives only the public key.

## Configuration

- For local backend development, set `vapid.public.key`, `vapid.private.key`, and
  `vapid.subject` in `application-local.properties`.
- On Render, set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT`.
- In the frontend `.env`, set `VITE_VAPID_PUBLIC_KEY` to the VAPID public key.
- On Vercel, set `VITE_VAPID_PUBLIC_KEY` to that same public key.

## Test locally

1. Start the backend and Vite frontend over their local development URLs.
2. Sign in with Chrome and select **Enable Notifications** in the navigation bar.
3. Minimize the browser or open a different browser profile.
4. Post a ride or make a booking from another signed-in user.
5. Confirm that the subscribed user receives the notification.

## Common errors

- `410` means the subscription expired; LNCTShares removes it automatically.
- `401` or `403` usually means the frontend public key and backend VAPID pair do not match.
- “Permission denied” must be corrected in the browser’s site notification settings.
- On iOS, web push requires an installed PWA and iOS 16.4 or later.

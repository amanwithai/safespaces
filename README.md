# SafeSpaces (MVP)

Text-only child safety extension with parent alerts.

## What’s Included
- Chrome extension with real-time text filtering
- Grooming/scam/impersonation pattern detection
- Safe-replace responses
- Parent dashboard with alerts + basic stats
- Subscription checkout stub

## Run Locally

1) Start the server
```bash
cd apps/server
npm install
npm run dev
```

2) Load the extension in Chrome
- Go to `chrome://extensions`
- Enable Developer mode
- Click “Load unpacked” and select `apps/extension`

3) Open the dashboard
- Open `apps/dashboard/index.html` in a browser
- Point the server URL to `http://localhost:8787`

## Deploy (Recommended)

### Backend: Railway
1) Create a new Railway project from this repo.
2) Set the root directory to `apps/server`.
3) Railway will detect the Node app and run `npm install` + `npm start`.
4) Set `PORT` to `8787` if you want to mirror local (optional).

### Dashboard: Hostinger
1) Upload the contents of `apps/dashboard` to your Hostinger public HTML directory.
2) Open the dashboard in a browser and set the Server URL to your Railway app URL.
3) The dashboard saves the Server URL in local storage per browser.

## Notes
- Alerts are stored in `apps/server/data/db.json`.
- Stripe checkout is stubbed. Add `STRIPE_SECRET` and replace the mocked URL when ready.
- Filtering is text-only; no image analysis or deepfake detection.

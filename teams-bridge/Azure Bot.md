# Setting Up a Microsoft Teams Bot

## Prerequisites

- A Microsoft Azure account (free tier works)
- A Microsoft 365 account with Teams (free developer tenant available at https://developer.microsoft.com/en-us/microsoft-365/dev-program)

---

## Step 1: Create an Azure Bot

1. Go to https://portal.azure.com
2. Search for **"Azure Bot"** in the top search bar
3. Click **Create**
4. Fill in:
   - **Bot handle**: any unique name (e.g. `my-company-bot`)
   - **Subscription**: your Azure subscription
   - **Resource group**: create new or use existing
   - **Pricing tier**: **F0 (Free)**
   - **Microsoft App ID**: select **"Create new Microsoft App ID"**
5. Click **Review + Create** then **Create**
6. Wait for deployment to complete, then click **Go to resource**

## Step 2: Get Your App ID and Password

1. In your Azure Bot resource, go to **Configuration** (left sidebar)
2. Copy the **Microsoft App ID** — you'll need this
3. Click **Manage Password** next to the App ID
4. You'll be taken to **Certificates & secrets**
5. Click **New client secret**
6. Enter any description (e.g. `bot-password`), pick expiry, click **Add**
7. Copy the **Value** column immediately (it won't show again) — this is your **App Password**

You now have:
- **Microsoft App ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **App Password**: the client secret value you just copied

## Step 3: Enable the Teams Channel

1. Go back to your Azure Bot resource
2. Click **Channels** in the left sidebar
3. Click **Microsoft Teams**
4. Accept the terms and click **Apply**

## Step 4: Deploy on MoltCompany.ai

1. Go to the deploy wizard on MoltCompany.ai
2. Pick your companion, model, and API key as usual
3. On the **Channel** step, select **Microsoft Teams**
4. Paste your **Microsoft App ID** and **App Password**
5. Complete the deployment

## Step 5: Set the Messaging Endpoint

1. After your companion is deployed, go to the **Console** on MoltCompany.ai
2. Find your companion card — it will show a blue box with the **Teams Messaging Endpoint** URL
3. Copy that URL (looks like `http://<your-ip>:3978/api/messages`)
4. Go back to Azure Portal → your Azure Bot → **Configuration**
5. Paste the URL into the **Messaging endpoint** field
6. Click **Apply**

## Step 6: Test in Teams

1. Open Microsoft Teams
2. Click **Apps** in the left sidebar
3. Search for your bot by the handle you chose in Step 1
4. If it doesn't appear, click **Manage your apps** → **Upload a custom app** → upload the app manifest (see below)
5. Start a chat with your bot and send a message

### Quick Test Without Installing in Teams

In Azure Portal → your Azure Bot → **Test in Web Chat** (left sidebar). Send a message there to verify the bot responds before installing in Teams.

---

## App Manifest (for custom app upload)

If your bot doesn't appear in the Teams app store, create a manifest:

1. Create a folder with these 3 files:

**manifest.json**:
```json
{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
  "manifestVersion": "1.16",
  "version": "1.0.0",
  "id": "YOUR_APP_ID_HERE",
  "developer": {
    "name": "Your Company",
    "websiteUrl": "https://moltcompany.ai",
    "privacyUrl": "https://moltcompany.ai/privacy",
    "termsOfUseUrl": "https://moltcompany.ai/terms"
  },
  "name": { "short": "My AI Bot" },
  "description": { "short": "AI Companion", "full": "AI Companion powered by MoltCompany.ai" },
  "icons": { "outline": "outline.png", "color": "color.png" },
  "accentColor": "#FFD600",
  "bots": [
    {
      "botId": "YOUR_APP_ID_HERE",
      "scopes": ["personal", "team", "groupChat"]
    }
  ]
}
```

2. Replace `YOUR_APP_ID_HERE` with your Microsoft App ID (both places)
3. Add two PNG icons: `color.png` (192x192) and `outline.png` (32x32, transparent)
4. Zip all 3 files into `bot.zip`
5. In Teams → **Apps** → **Manage your apps** → **Upload a custom app** → select `bot.zip`

---

## Local Testing with Bot Framework Emulator

For testing without Azure or Teams:

1. Download the Bot Framework Emulator from https://github.com/microsoft/BotFramework-Emulator/releases
2. Start the bridge locally: `cd teams-bridge && npm start`
3. Open the Emulator → connect to `http://localhost:3978/api/messages`
4. Leave App ID and Password blank
5. Send a message — it flows through the full pipeline

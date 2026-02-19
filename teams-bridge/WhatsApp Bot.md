# Setting Up a WhatsApp Bot

## Prerequisites

- A Meta (Facebook) Business account
- A phone number that is NOT already registered with WhatsApp

---

## Step 1: Create a Meta App

1. Go to https://developers.facebook.com
2. Click **My Apps** → **Create App**
3. Select **Business** as the app type
4. Fill in the app name (e.g. `My AI Bot`) and select your Business Account
5. Click **Create App**

## Step 2: Add WhatsApp to Your App

1. In your app dashboard, click **Add Product**
2. Find **WhatsApp** and click **Set Up**
3. Follow the prompts to connect your Meta Business Account

## Step 3: Get Your Credentials

1. Go to **WhatsApp** → **API Setup** in the left sidebar
2. You'll see a **Test Phone Number** assigned to you (or add your own)
3. Copy the **Phone Number ID** — you'll need this
4. For a permanent token:
   - Go to **Business Settings** → **System Users**
   - Create a system user (Admin role)
   - Click **Generate Token** → select your app → check `whatsapp_business_messaging` permission
   - Copy the token — this is your **Permanent Access Token**

You now have:
- **Phone Number ID**: `102345678901234`
- **Permanent Access Token**: the system user token you just generated

## Step 4: Set the Webhook

1. Go to **WhatsApp** → **Configuration** in your Meta App Dashboard
2. Click **Edit** next to Webhook
3. Set **Callback URL** to: `https://moltcompany.ai/api/whatsapp/webhook`
4. Set **Verify Token** to: `moltcompany-whatsapp-verify`
5. Click **Verify and Save**
6. Subscribe to the **messages** webhook field

## Step 5: Deploy on MoltCompany.ai

1. Go to the deploy wizard on MoltCompany.ai
2. Pick your companion, model, and API key as usual
3. On the **Channel** step, select **WhatsApp**
4. Paste your **Phone Number ID** and **Permanent Access Token**
5. Complete the deployment

## Step 6: Test

1. Open WhatsApp on your phone
2. Send a message to the phone number shown in your Meta App Dashboard
3. Your AI companion should reply!

### Adding Test Numbers

During development (before Meta app review), only verified numbers can message your bot:

1. Go to **WhatsApp** → **API Setup**
2. Under **To**, click **Manage phone number list**
3. Add phone numbers and verify them with the code Meta sends

---

## Going Live (Production)

To let anyone message your bot (not just test numbers):

1. Add a real phone number to your WhatsApp Business Account
2. Submit your Meta App for **App Review**
3. Request the `whatsapp_business_messaging` permission
4. Once approved, anyone can message your bot

---

## Quick Reference

| Item | Value |
|---|---|
| Webhook URL | `https://moltcompany.ai/api/whatsapp/webhook` |
| Verify Token | `moltcompany-whatsapp-verify` |
| Required Permission | `whatsapp_business_messaging` |
| API Version | v21.0 |

# Stripe Payment Integration Setup

This document explains how to set up Stripe payment integration for the Premiere Stays hotel management system.

## Prerequisites

1. A Stripe account (create one at https://stripe.com)
2. Access to your Stripe dashboard

## Setup Steps

### 1. Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** > **API Keys**
3. Copy your **Publishable key** and **Secret key**

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Account Information (from OwnerRez)
STRIPE_ACCOUNT_NAME=Premiere Stays Miami
STRIPE_ACCOUNT_EMAIL=info@premierestaysmiami.com
```

### 3. Set Up Webhooks (Optional but Recommended)

1. In your Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select the following events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the webhook signing secret and add it to your environment variables

### 4. Test the Integration

1. Use Stripe's test card numbers for testing:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002
   - **Requires Authentication**: 4000 0025 0000 3155

2. Use any future expiry date and any 3-digit CVC

## Features

### Payment Methods Supported
- Credit/Debit Cards (Visa, Mastercard, American Express)
- PayPal (coming soon)
- Google Pay (coming soon)

### Security Features
- PCI DSS compliant payment processing
- Encrypted card data transmission
- Secure tokenization
- Webhook verification

### Payment Flow
1. User selects payment method
2. User enters card details securely
3. Payment is processed through Stripe
4. Booking is confirmed upon successful payment
5. Confirmation page shows payment status

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Check that your environment variables are correctly set
   - Ensure you're using the correct test/live keys

2. **Payment Form Not Loading**
   - Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
   - Check browser console for errors

3. **Webhook Not Working**
   - Ensure webhook URL is accessible
   - Check webhook secret is correct
   - Verify webhook events are selected

### Testing

- Always test with Stripe test keys first
- Use test card numbers provided by Stripe
- Check Stripe Dashboard for transaction logs
- Monitor webhook delivery in Stripe Dashboard

## Production Deployment

1. Replace test keys with live keys
2. Update webhook URL to production domain
3. Test with real payment methods
4. Monitor payment success rates
5. Set up proper error handling and logging

## Support

For Stripe-related issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For application-specific issues:
- Check the application logs
- Review the payment flow implementation
- Verify OwnerRez integration is working











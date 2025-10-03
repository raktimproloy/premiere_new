'use client'
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { getStripePublishableKey } from '@/lib/stripe';

// Initialize Stripe
const stripePromise = loadStripe(getStripePublishableKey());

interface PaymentFormProps {
  amount: number;
  bookingData: any;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isLoading?: boolean;
}

// Payment form component that uses Stripe Elements
const PaymentFormElement: React.FC<{
  amount: number;
  bookingData: any;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isLoading: boolean;
}> = ({ amount, bookingData, onPaymentSuccess, onPaymentError, isLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency: 'usd',
            bookingData,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setClientSecret(data.clientSecret);
        } else {
          onPaymentError(data.message || 'Failed to create payment intent');
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        onPaymentError('Failed to create payment intent');
      }
    };

    createPaymentIntent();
  }, [amount, bookingData, onPaymentError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: bookingData.guestName,
            email: bookingData.guestEmail,
          },
        },
      });

      if (error) {
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on our backend
        const confirmResponse = await fetch('/api/stripe/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
          }),
        });

        const confirmData = await confirmResponse.json();
        
        if (confirmData.success) {
          onPaymentSuccess(paymentIntent.id);
        } else {
          onPaymentError(confirmData.message || 'Payment confirmation failed');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
        
        {/* Card Element */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">Total Amount</span>
            <span className="text-2xl font-bold text-blue-600">
              ${amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || !clientSecret || processing || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800">Secure Payment</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your payment information is encrypted and processed securely by Stripe. 
              We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

// Main PaymentForm component with Stripe Elements provider
const PaymentForm: React.FC<PaymentFormProps> = ({ 
  amount, 
  bookingData, 
  onPaymentSuccess, 
  onPaymentError, 
  isLoading = false 
}) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormElement
        amount={amount}
        bookingData={bookingData}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        isLoading={isLoading}
      />
    </Elements>
  );
};

export default PaymentForm;


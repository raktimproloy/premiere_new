'use client'
import React, { useState } from 'react';

interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  image: string;
  available: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onMethodSelect: (methodId: string) => void;
  amount: number;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  amount
}) => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      label: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express',
      image: '/images/mastercard.png',
      available: true
    },
    {
      id: 'paypal',
      label: 'PayPal',
      description: 'Pay with your PayPal account',
      image: '/images/paypal.png',
      available: false // Disabled for now, can be enabled later
    },
    {
      id: 'googlepay',
      label: 'Google Pay',
      description: 'Quick and secure payment',
      image: '/images/gpay.png',
      available: false // Disabled for now, can be enabled later
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => method.available && onMethodSelect(method.id)}
            disabled={!method.available}
            className={`w-full flex items-center p-4 rounded-lg border transition-all duration-200 ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : method.available
                ? 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-shrink-0">
                <img
                  src={method.image}
                  alt={method.label}
                  className="h-8 w-12 object-contain"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {method.label}
                  </h4>
                  {!method.available && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {method.description}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedMethod === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-700">Total Amount</span>
          <span className="text-2xl font-bold text-blue-600">
            ${amount.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          All prices include applicable taxes and fees
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-green-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-green-800">Secure & Protected</h4>
            <p className="text-sm text-green-700 mt-1">
              Your payment information is encrypted and processed securely. 
              We use industry-standard security measures to protect your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;



















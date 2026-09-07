import { useCallback } from 'react';

/**
 * Dynamically loads the Razorpay checkout.js script if not already present.
 * @returns {Promise<boolean>}
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.getElementById('razorpay-checkout-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Custom hook to initiate and manage Razorpay checkout flows.
 */
export function useRazorpay() {
  const openCheckout = useCallback(
    async ({
      key,
      orderId,
      amount,
      currency = 'INR',
      name = 'Library Sathi',
      description = '',
      image = '',
      prefill = {},
      theme = { color: '#4f46e5' },
      onSuccess,
      onError,
      onDismiss,
    }) => {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        const err = new Error('Razorpay SDK failed to load. Please check your internet connection.');
        if (onError) onError(err);
        return;
      }

      const keyId = key || import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!keyId) {
        const err = new Error('Razorpay Key ID is not configured.');
        if (onError) onError(err);
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name,
        description,
        image,
        order_id: orderId,
        handler: function (response) {
          // response contains: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
          if (onSuccess) onSuccess(response);
        },
        prefill: {
          name: prefill.name || '',
          email: prefill.email || '',
          contact: prefill.contact || prefill.phone || '',
        },
        theme,
        modal: {
          ondismiss: function () {
            if (onDismiss) onDismiss();
          },
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          if (onError) onError(response.error || new Error('Payment failed'));
        });
        rzp.open();
      } catch (err) {
        if (onError) onError(err);
      }
    },
    []
  );

  return { openCheckout };
}

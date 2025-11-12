// services/paymentService.ts
import { EventBooking, VenueBooking, GuestDetails } from '../types.ts';

declare global {
    interface Window {
        google: any;
    }
}

const getGooglePayClient = () => {
    if (!window.google || !window.google.payments || !window.google.payments.api) {
      return null;
    }
    return new window.google.payments.api.PaymentsClient({ environment: 'TEST' });
};

type BookingData = Omit<EventBooking, 'id' | 'paymentId'> | Omit<VenueBooking, 'id' | 'paymentId'>;

interface PendingBooking {
    totalAmount: number;
    transactionLabel: string;
    bookingData: BookingData;
    guestDetails?: GuestDetails;
}

export const initiateGooglePayCheckout = async (
    pendingBookingData: PendingBooking,
    onBookingSuccess: (bookingData: BookingData, guestDetails?: GuestDetails) => void
) => {
    const { totalAmount, transactionLabel, bookingData, guestDetails } = pendingBookingData;

    const paymentsClient = getGooglePayClient();
    if (!paymentsClient) {
        alert("Google Pay is not available. Please try again later.");
        return;
    }

    const baseCardPaymentMethod = {
        type: 'CARD',
        parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA'],
        }
    };

    const isReadyToPayRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [baseCardPaymentMethod]
    };

    try {
        const isReadyToPay = await paymentsClient.isReadyToPay(isReadyToPayRequest);

        if (isReadyToPay.result) {
            const paymentDataRequest: any = {
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [{
                    ...baseCardPaymentMethod,
                    tokenizationSpecification: {
                        type: 'PAYMENT_GATEWAY',
                        parameters: {
                            gateway: 'example',
                            gatewayMerchantId: 'exampleGatewayMerchantId',
                        },
                    },
                }],
                merchantInfo: {
                    merchantId: '12345678901234567890',
                    merchantName: 'Tickets Villa',
                },
                transactionInfo: {
                    totalPriceStatus: 'FINAL',
                    totalPrice: String(totalAmount.toFixed(2)),
                    currencyCode: 'INR',
                    countryCode: 'IN',
                },
            };
            
            const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
            // In a real app, you would process paymentData.paymentMethodData.tokenizationData.token
            console.log('Google Pay success:', paymentData);
            onBookingSuccess(bookingData, guestDetails);

        } else {
             alert("Google Pay is not configured on this device.");
        }
    } catch (error: any) {
        console.error('Google Pay API Error:', error);
        if (error.statusCode !== 'CANCELED') {
          alert(`An error occurred during the Google Pay transaction. Details: ${error.statusMessage || 'Unknown error'}`);
        }
    }
};
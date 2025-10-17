

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '@/components/CheckoutForm';


const stripePromise = loadStripe('pk_test_51SAtWhKFPi4gMQQnl5IahKw9gDsuSYHUGgs3cFuFasveKQIu7TMbIe4fkwOGwzAYovd2DXAuGebBF1qVze0LSPhp00QjNbOjEf');

const PaymentPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
            <img src="/lovable-uploads/4e68bccf-80d3-468a-9ffe-3f3aee0bffdd.png" alt="Digital Latino" className="h-8 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Completa tu Suscripción</h1>
            <p className="text-gray-500">Estás a un paso de activar tu cuenta.</p>
        </div>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
};

export default PaymentPage;
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '@/components/CheckoutForm';
import { useState } from 'react';
import { Check } from 'lucide-react';


const stripePromise = loadStripe('pk_test_51SAtWhKFPi4gMQQnl5IahKw9gDsuSYHUGgs3cFuFasveKQIu7TMbIe4fkwOGwzAYovd2DXAuGebBF1qVze0LSPhp00QjNbOjEf');
 
 const PLANS = {
  // Monthly plan
  MONTHLY: {
    id: 'price_1STRTuKFPi4gMQQnEZL9oIYo',
    name: 'Plan Mensual',
    amount: 120,
    interval: '/mes',
    features: ['Acceso completo a Charts', 'Métricas avanzadas', 'Soporte 24/7']

  },
  //Yearly plan 
  YEARLY: {
    id: 'price_1STRTuKFPi4gMQQnRrzC1aXX',
    name: 'Plan Anual',
    amount: 1000,
    interval: '/año',
    features: ['Acceso completo a Charts', 'Métricas avanzadas', 'Soporte 24/7']
 }
};

type Plan = typeof PLANS.MONTHLY;

//Plan card component
interface PlanCardProps {
  plan: Plan;
  onSelect: () => void;
  formatPrice: (amount: number) => string;
  isPopular?: boolean;
}

const PlanCard = ({ plan, onSelect, formatPrice, isPopular = false }: PlanCardProps) => (
  <div className={`relative border rounded-lg p-6 ${isPopular ? 'border-purple-500 border-2 shadow-lg' : 'border-gray-300'}`}>
    {isPopular && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
        MÁS POPULAR
        </div>
    )}
    <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
      <p className="mt-4">
        <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.amount)}</span>
        <span className="text-lg font-medium text-gray-500">{plan.interval}</span>
        </p>
        <ul className="mt-6 space-y-2 text-gray-600">
          {plan.features.map(feature => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>{feature}</span>

            </li>
          ))}

        </ul>
        <button
        onClick={onSelect}
        className={`mt-8 w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
          isPopular
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
        }`}
        >
          Seleccionar Plan
        </button>
    </div>
);

const PaymentPage = () => {
  //State to save the plan that user chooses
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
   //price to USD
   const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      }).format(amount);

    };
    // Id dont select plan, show the SELECTOR
    if (!selectedPlan) {

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
            <img src="/lovable-uploads/4e68bccf-80d3-468a-9ffe-3f3aee0bffdd.png" alt="Digital Latino" className="h-8 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Elige tu Plan</h1>
            <p className="text-gray-500">Accede a todas las funciones premium.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 pt-4">
          {/* ---  Monthly card --- */}
          <PlanCard
          plan={PLANS.MONTHLY}
          onSelect={() => setSelectedPlan(PLANS.MONTHLY)}
          formatPrice={formatPrice}
          />
          {/* --- YEARLY card --- */}
          <PlanCard
          plan={PLANS.YEARLY}
          onSelect={() => setSelectedPlan(PLANS.YEARLY)}
          formatPrice={formatPrice}
          isPopular={true}
          /> 
        </div>
      </div>
    </div>
  
  );
}
 return (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <img src="/lovable-uploads/4e68bccf-80d3-468a-9ffe-3f3aee0bffdd.png" alt="Digital Latino" className="h-8 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">Completa tu Suscripción</h1>
        <p className="text-gray-500">Estás a un paso de activar tu cuenta.</p>
      </div>
      {/* display the summary of the selected plan */}
      <div className="text-center border-t border-b py-4 my-6">
        <p className="text-lg text-gray-600">Total a Pagar ({selectedPlan.name}):</p>
        <p className="text-4xl font-bold text-purple-700">{formatPrice(selectedPlan.amount)}</p>
        <p className="text-sm text-gray-500">(Suscripción {selectedPlan.interval.replace('/', '')})</p>
        <button onClick={() => setSelectedPlan(null)} className="text-sm text-purple-600 hover:text-purple-800 mt-2 font-medium">
          ← Cambiar de plan
        </button>
      </div>
      <Elements stripe={stripePromise}>
        {/* ID plan */}
        <CheckoutForm priceId={selectedPlan.id} />
      </Elements>
    </div>
  </div>
 );
};

export default PaymentPage;
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { token } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements || !token) {
            toast({
                title: "Error",
                description: "El formulario de pago no está listo",
                variant: "destructive"
            });
            setLoading(false);
            return;
        }

        try {
            const createSubResponse = await fetch('https://security.digital-latino.com/api/subscriptions/create', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ priceId: 'price_1SG7PeKFPi4gMQQnDVkxxBZD' }),
            });
            if (!createSubResponse.ok) {
                const errorBody = await createSubResponse.text();
                throw new Error(errorBody || "No se pudo iniciar el proceso de pago");
            }
            const { clientSecret } = await createSubResponse.json();

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error("El campo de la tarjeta no se encontro");
            }

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: cardElement },
            });
            if (error) {
                throw new Error(error.message || "Ocurrió un error con el pago.");
            }
            if (paymentIntent?.status === 'succeeded') {
                toast({ title: "¡Pago exitoso!", description: "Tu suscripción está activa. Redirigiendo..." });
                setTimeout(() => window.location.href = '/weekly-top-songs', 2000);
            }
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">Ingresa los datos de tu tarjeta</h2>
            <div className="p-4 border rounded-md bg-gray-50">
                <CardElement options={{ style: { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } } } }} />
            </div>
            <Button type="submit" disabled={!stripe || loading} className="w-full h-12 text-lg bg-purple-600 text-white hover:bg-purple-700">
                {loading ? 'Procesando...' : 'Pagar Suscripción'}
            </Button>
        </form>
    );
};
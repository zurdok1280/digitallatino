import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CheckoutForm = ({ priceId }: { priceId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements || !token) {
      toast({
        title: "Error",
        description: "El formulario de pago no está listo",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      //const createSubResponse = await fetch("http://localhost:8085/api/subscriptions/create-subscription-trial", {
      const createSubResponse = await fetch('https://security.digital-latino.com/api/subscriptions/create', {

          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ priceId: priceId }),
        },
      );
      if (!createSubResponse.ok) {
        const errorBody = await createSubResponse.text();
        throw new Error(errorBody || "No se pudo iniciar el proceso de pago");
      }
      const { clientSecret } = await createSubResponse.json();

      console.log("Clave recibida:", clientSecret);
      if (clientSecret.startsWith("seti_")) {
        alert(
          "✅ CONFIRMADO: Stripe generó una PRUEBA GRATUITA. No se cobrará nada.",
        );
      } else {
        alert("⚠️ CUIDADO: Stripe generó un COBRO INMEDIATO.");
      }
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("El campo de la tarjeta no se encontro");
      }

      // days free trial
      let result;
      // if is free trial, the setUpIntent starts with 'seti_'
      if (clientSecret.startsWith("seti_")) {
        result = await stripe.confirmCardSetup(clientSecret, {
          payment_method: { card: cardElement },
        });
      } else {
        // if is not free trial, the paymentIntent starts with 'pi_'
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        });
      }
      // get error , setUpIntent or paymentIntent
      const { error, setupIntent, paymentIntent } = result;

      if (error) {
        throw new Error(error.message || "Ocurrió un error con el pago.");
      }

      if (
        (setupIntent && setupIntent.status === "succeeded") ||
        (paymentIntent && paymentIntent.status === "succeeded")
      ) {
        toast({
          title: "¡Pago exitoso!",
          description:
            "Tu prueba gratis de 15 días ha comenzado. Redirigiendo...",
        });
        //Get new token with updated user info
        try {
          const refreshResponse = await fetch('https://security.digital-latino.com/api/auth/refresh-token', {
          //const refreshResponse = await fetch("http://localhost:8085/api/auth/refresh-token",{
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            // update the login state with the new token
            login(data.token);
            navigate("/");
          } else {
            console.error("No se pudo refrescar el token");
            window.location.href = "/";
          }
        } catch (refreshError) {
          console.error("Error de red al refrescar:", refreshError);
          window.location.href = "/";
        }
      }

      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">
        Ingresa los datos de tu tarjeta
      </h2>
      <div className="p-4 border rounded-md bg-gray-50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": { color: "#aab7c4" },
              },
            },
          }}
        />
      </div>
      <p className="text-xs text-gray-500 text-center">
        Se validará tu tarjeta pero no se cobrará nada hoy.
      </p>
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full h-12 text-lg bg-purple-600 text-white hover:bg-purple-700"
      >
        {loading ? "Procesando..." : "Iniciar 15 Días Gratis"}
      </Button>
    </form>
  );
};

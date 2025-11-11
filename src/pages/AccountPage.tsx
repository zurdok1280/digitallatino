import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

interface SubscriptionProfile {
  plan: string;
  status: string;
  expiresAt: string;
}

interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AccountPage = () => {
  //States for save data , loading and error
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); //get token from useAuth hook

  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionProfile | null>(null);
  const [loadingSub, setLoadingSub] = useState<boolean>(true);
  const [errorSub, setErrorSub] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  //Change password
  const [showPasswordDialog, setShowPasswordDialog] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setLoading(false);
        setError("Usuario no autenticado");
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(
          "https://security.digital-latino.com/api/auth/me",
          //"http://localhost:8085/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("No se pudo obtener la información del usuario");
        }

        const data: UserProfile = await response.json();
        setUserData(data);
        setError(null);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!token) {
        setLoadingSub(false);
        setErrorSub("Usuario no autenticado");
        return;
      }
      try {
        setLoadingSub(true);
        const response = await fetch(
          "https://security.digital-latino.com/api/subscriptions/me",
          //"http://localhost:8085/api/subscriptions/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            errorText || "No se pudo obtener la información de la suscripción"
          );
        }
        const data: SubscriptionProfile = await response.json();
        setSubscriptionData(data);
        setErrorSub(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setErrorSub(err.message);
      } finally {
        setLoadingSub(false);
      }
    };
    fetchSubscriptionData();
  }, [token]);

  const handleCancelSubscription = async () => {
    //logic to cancel subscription
    //Get information
    setShowConfirmDialog(false);
    setIsCancelling(true);
    setErrorSub(null);
    try {
      const response = await fetch(
        "https://security.digital-latino.com/api/subscriptions/cancel",
        //"http://localhost:8085/api/subscriptions/cancel",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "No se pudo cancelar la suscripción.");
      }

      //Update data
      const updatedSubData: SubscriptionProfile = await response.json();
      setSubscriptionData(updatedSubData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrorSub(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //logic to change password
    setPasswordData({
      ...passwordData,
      [e.target.id]: e.target.value,
      });
    };

    //clean the form and messages
    const resetPasswordForm = () => {
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordError(null);
      setPasswordSuccess(null);
      setIsChangingPassword(false);
    };

    //call to send form
    const handlePasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); // Prevent the page from reloading
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError("La nueva contraseña y la confirmación no coinciden.");
        return;
      }
      if (passwordData.newPassword.length < 6) {
        setPasswordError("La nueva contraseña debe tener al menos 10 caracteres.");
        return;
      }
      setIsChangingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      try{
        const response = await fetch(
          "https://security.digital-latino.com/api/auth/change-password",
          //"http://localhost:8085/api/auth/change-password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "No se pudo cambiar la contraseña.");
      }
      //Succes
      setPasswordSuccess("¡Contraseña actualizada con éxito!");
      setTimeout(() => {
        setShowPasswordDialog(false);
        }, 2000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any 
      } catch (err: any) {
        setPasswordError(err.message);
      } finally {
        setIsChangingPassword(false);

      }
  };

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Mi Cuenta</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && <p>Cargando información...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {userData && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nombre:
                  </label>
                  <p> {userData.firstName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Apellido:
                  </label>
                  <p> {userData.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email:
                  </label>
                  <p> {userData.email}</p>
                </div>

                <Dialog
                  open={showPasswordDialog}
                  onOpenChange={(isOpen) => {
                    setShowPasswordDialog(isOpen);
                    if (!isOpen) {
                      resetPasswordForm();
                    }
                  }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline">Cambiar Contraseña</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Cambiar Contraseña</DialogTitle>
                        <DialogDescription>
                          Ingresa tu contraseña actual y una nueva contraseña.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handlePasswordSubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="oldPassword" className="text-right">
                              Contraseña Actual
                            </Label>
                            <Input
                            id="oldPassword"
                            type="password"
                            className="col-span-3"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newPassword" className="text-right">
                              Nueva contraseña
                            </Label>
                            <Input
                            id="newPassword"
                            type="password"
                            className="col-span-3"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="confirmPassword" className="text-right">
                              Confirmar contraseña
                            </Label>
                            <Input
                            id="confirmPassword"
                            type="password"
                            className="col-span-3"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            />
                          </div>
                        </div>

                        {/*Mesagge Succes or faild*/}
                        {passwordError && <p className="text-red-500 text-sm mb-4">{passwordError}</p>}
                        {passwordSuccess && <p className="text-green-500 text-sm mb-4">{passwordSuccess}</p>}
                        
                        <DialogFooter>
                          <Button
                            type="submit"
                            disabled={isChangingPassword || !!passwordSuccess}
                            className="bg-purple-600 text-white hover:bg-purple-700"
                            >
                              {isChangingPassword ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Suscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingSub && <p>Cargando información de suscripción...</p>}
            {errorSub && <p className="text-red-500">{errorSub}</p>}
            {subscriptionData && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Plan:
                  </label>
                  <p> {subscriptionData.plan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Expira el:
                  </label>
                  <p> {subscriptionData.expiresAt}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Estado:
                  </label>
                  <p> {subscriptionData.status}</p>
                </div>
                <AlertDialog
                  open={showConfirmDialog}
                  onOpenChange={setShowConfirmDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={
                        isCancelling ||
                        subscriptionData.status.includes("cancelar")
                      }
                    >
                      {isCancelling
                        ? "Cancelando..."
                        : subscriptionData.status.includes("cancelar")
                        ? "Cancelación programada"
                        : "Cancelar Suscripción"}
                    </Button>
                  </AlertDialogTrigger>

                  {/*Popup to confirm cancel suscription*/}
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Realmente deseas cancelar tu suscripción? Tu acceso
                        premium continuará hasta la fecha de expiración de tu
                        ciclo de facturación actual.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        Mantener suscripción
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                        className="bg-purple-600 text-white hover:bg-purple-700"
                      >
                        {isCancelling
                          ? "Cancelando..."
                          : "Sí, cancelar suscripción"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountPage;

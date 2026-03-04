import React, { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Search, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
export interface AdminUser {
  id: number;
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para búsqueda y ordenamiento
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AdminUser | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  // Estados para los modales de confirmación
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [roleChangeData, setRoleChangeData] = useState<{
    id: number;
    role: string;
  } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Estados para el modal de "Agregar Usuario"
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "UNVERIFIED",
  });
  const [isCreating, setIsCreating] = useState(false);

  //Estado para Esitar usuarios
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  // Estado para emial de contraseña
  const [isSendingReset, setIsSendingReset] = useState(false);

  //const LOCAL_API_URL = "http://localhost:8085/admin/users";
  const LOCAL_API_URL = "https://security.digital-latino.com/admin/users";
  const getToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(LOCAL_API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error al cargar los usuarios");

      const data = await response.json();
      setUsers(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Lógica de filtrado y ordenamiento
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Búsqueda global
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(lowercasedSearch) ||
          user.lastName?.toLowerCase().includes(lowercasedSearch) ||
          user.email?.toLowerCase().includes(lowercasedSearch) ||
          user.role?.toLowerCase().includes(lowercasedSearch) ||
          String(user.id).includes(lowercasedSearch) ||
          String(user.userId).includes(lowercasedSearch)
      );
    }

    // Ordenamiento
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof AdminUser] || "";
        const bValue = b[sortConfig.key as keyof AdminUser] || "";

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [users, searchTerm, sortConfig]);

  const requestSort = (key: keyof AdminUser) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName: keyof AdminUser) => {
    if (sortConfig.key !== columnName) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400 ml-1 inline-block" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-purple-600 ml-1 inline-block" />
    ) : (
      <ChevronDown className="w-4 h-4 text-purple-600 ml-1 inline-block" />
    );
  };

  // CAMBIAR ROL
  const confirmRoleChange = async () => {
    if (!roleChangeData) return;
    setIsUpdatingRole(true);

    try {
      const response = await fetch(
        `${LOCAL_API_URL}/${roleChangeData.id}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: roleChangeData.role }),
        },
      );

      if (response.ok) {
        toast({
          title: "Rol actualizado",
          description: `El rol se cambió exitosamente a ${roleChangeData.role}.`,
          className: "bg-purple-50 border-purple-200",
        });
        fetchUsers();
      } else {
        throw new Error("No se pudo actualizar el rol");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        title: "Error al actualizar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRole(false);
      setRoleChangeData(null); // Cerramos el modal
    }
  };

  //ELIMINAR
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`${LOCAL_API_URL}/${userToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast({
          title: "Usuario eliminado",
          description:
            "El usuario ha sido borrado del sistema permanentemente.",
        });
        fetchUsers();
      } else {
        throw new Error("No se pudo eliminar el usuario");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        title: "Error al eliminar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  // CREAR NUEVO USUARIO
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch(LOCAL_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "No se pudo crear el usuario");
      }

      toast({
        title: "¡Éxito!",
        description: "El usuario ha sido creado correctamente.",
        className: "bg-green-50 border-green-200",
      });
      setShowAddModal(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "UNVERIFIED",
      });
      fetchUsers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        title: "Error al crear",
        description: "Hubo un problema al crear el usuario. Revisa los datos.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };
  //EDITAR USUARIO
  //Abirir modal
  const openEditModal = (user: AdminUser) => {
    setUserToEdit(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  };
  //guardar edicion de usuario
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    setIsEditing(true);

    const realId = userToEdit.id || userToEdit.userId;
    try {
      const response = await fetch(`${LOCAL_API_URL}/${realId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "No se pudo actualizar el usuario");
      }

      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario se guardaron correctamente.",
        className: "bg-blue-50 border-blue-200",
      });
      setUserToEdit(null);
      fetchUsers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        title: "Error al actualizar",
        description: err.message || "Hubo un problema al guardar los cambios.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };
  // Cambiar Password
  const handleSendPasswordReset = async () => {
    // si no hay usuario seleccionado, no envía nada
    if (!editFormData.email) return;
    setIsSendingReset(true);
    try {
      const response = await fetch(
        // "http://localhost:8085/api/auth/forgot-password",
        "https://security.digital-latino.com/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: editFormData.email }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo enviar el correo");
      }

      toast({
        title: "Correo enviado",
        description: `Se ha enviado un enlace de recuperación a ${editFormData.email}.`,
        className: "bg-purple-50 border-purple-200 text-purple-900",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Hubo un problema al enviar el enlace.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white min-h-screen text-black relative">
      {/*  título y botón de agregar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Panel de Administrador</h1>
          <p className="text-gray-600">
            Gestiona los usuarios de la plataforma, agrega, cambia sus roles o
            elimínalos del sistema.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
        >
          <span className="text-base leading-none">+</span> Agregar Usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
          placeholder="Buscar usuarios por ID, nombre, email o rol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-gray-700">
                <th
                  className="p-4 font-semibold text-sm cursor-pointer hover:bg-gray-200 transition-colors select-none group"
                  onClick={() => requestSort('id')}
                >
                  <div className="flex items-center">
                    ID {getSortIcon('id')}
                  </div>
                </th>
                <th
                  className="p-4 font-semibold text-sm cursor-pointer hover:bg-gray-200 transition-colors select-none group"
                  onClick={() => requestSort('firstName')}
                >
                  <div className="flex items-center">
                    Nombre {getSortIcon('firstName')}
                  </div>
                </th>
                <th
                  className="p-4 font-semibold text-sm cursor-pointer hover:bg-gray-200 transition-colors select-none group"
                  onClick={() => requestSort('email')}
                >
                  <div className="flex items-center">
                    Email {getSortIcon('email')}
                  </div>
                </th>
                <th
                  className="p-4 font-semibold text-sm cursor-pointer hover:bg-gray-200 transition-colors select-none group"
                  onClick={() => requestSort('role')}
                >
                  <div className="flex items-center">
                    Rol Actual {getSortIcon('role')}
                  </div>
                </th>
                <th className="p-4 font-semibold text-sm text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map((u) => {
                const realId = u.id || u.userId;

                return (
                  <tr
                    key={realId}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-sm text-gray-500">#{realId}</td>
                    <td className="p-4 font-medium">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="p-4 text-sm text-black">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full inline-block
                      ${u.role === "ADMIN"
                            ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold"
                            : u.role === "PREMIUM"
                              ? "bg-purple-600 text-white font-bold"
                              : u.role === "ARTIST"
                                ? "bg-pink-500 text-white font-bold"
                                : "bg-gray-200 text-gray-700 font-normal"
                          }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      <select
                        className="bg-white border border-gray-200 rounded text-sm p-1 cursor-pointer text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={u.role}
                        onChange={(e) =>
                          setRoleChangeData({
                            id: realId as number,
                            role: e.target.value,
                          })
                        }
                      >
                        <option value="UNVERIFIED">UNVERIFIED</option>
                        <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                        <option value="PREMIUM">PREMIUM</option>
                        <option value="ARTIST">ARTIST</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      {/* Botón de Editar */}
                      <button
                        onClick={() => openEditModal(u)}
                        title="Editar usuario"
                        className="text-blue-600 hover:text-blue-700 transition-colors p-1"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setUserToDelete(realId as number)}
                        className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors text-sm font-medium border border-red-200"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAndSortedUsers.length === 0 && (
            <div className="text-center p-8 text-gray-500">
              {searchTerm
                ? "No se encontraron usuarios que coincidan con la búsqueda."
                : "No se encontraron usuarios en la base de datos."}
            </div>
          )}
        </div>
      </div>

      {/* Modal para agregar nuevo usuario */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-4">Agregar Nuevo Usuario</h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  required
                  type="email"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  required
                  type="password"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol inicial
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="UNVERIFIED">UNVERIFIED</option>
                  <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="ARTIST">ARTIST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isCreating ? "Creando..." : "Guardar Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL PARA EDITAR USUARIO */}
      {userToEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-4">Editar Usuario</h2>

            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={editFormData.firstName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={editFormData.lastName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  required
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={handleSendPasswordReset}
                    disabled={isSendingReset}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium hover:underline focus:outline-none transition-colors"
                  >
                    {isSendingReset ? 'Enviando...' : 'Enviar enlace para cambiar contraseña'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setUserToEdit(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                >
                  {isEditing ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
      <AlertDialog
        open={userToDelete !== null}
        onOpenChange={() => !isDeleting && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">
              ¿Estás seguro de eliminar este usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la cuenta del usuario y removerá todos sus datos de nuestros
              servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteUser();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Eliminando..." : "Sí, eliminar usuario"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL DE CONFIRMACIÓN PARA CAMBIAR ROL */}
      <AlertDialog
        open={roleChangeData !== null}
        onOpenChange={() => !isUpdatingRole && setRoleChangeData(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">
              ¿Confirmar cambio de rol?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de cambiar el rol de este usuario a{" "}
              <span className="font-bold text-black">
                {roleChangeData?.role}
              </span>
              . ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isUpdatingRole}
              className="hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmRoleChange();
              }}
              disabled={isUpdatingRole}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isUpdatingRole ? "Actualizando..." : "Sí, cambiar rol"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;

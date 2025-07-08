'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle, Lock, UserCheck, UserX, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { UsuariosService } from '@/services/usuarios.service';
import { User as UserType } from '@/types';
import { toast } from 'react-hot-toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function EditUsuarioPage() {
    const params = useParams();
    const router = useRouter();
    const [usuario, setUsuario] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        rol: '',
        password: '' // Campo para nueva contraseña - vacío significa "no cambiar"
    });
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [hasSeenSecurityWarning, setHasSeenSecurityWarning] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchUsuario(params.id as string);
        }
    }, [params.id]);

    useEffect(() => {
        // Mostrar modal de seguridad cuando el componente se monte
        if (usuario && !hasSeenSecurityWarning) {
            setShowSecurityModal(true);
        }
    }, [usuario, hasSeenSecurityWarning]);

    const fetchUsuario = async (id: string) => {
        try {
            const data = await UsuariosService.getById(parseInt(id));
            setUsuario(data);
            setFormData({
                nombre: data.nombre || '',
                email: data.email || '',
                rol: data.rol || '',
                password: '' // Mantener vacío para nuevas contraseñas, no sobrescribir
            });
        } catch (error) {
            console.error('Error fetching usuario:', error);
            setError('Error al cargar los datos del usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuario) return;

        // Validar que la contraseña sea obligatoria
        if (!formData.password || formData.password.trim().length < 6) {
            toast.error('La contraseña es obligatoria y debe tener al menos 6 caracteres', {
                duration: 4000,
                icon: '🔒'
            });
            return;
        }

        setSaving(true);
        try {
            // Preparar datos para actualización - ahora la contraseña es obligatoria
            const dataToUpdate: { nombre: string; email: string; rol: string; password: string } = {
                nombre: formData.nombre.trim(),
                email: formData.email.trim(),
                rol: formData.rol,
                password: formData.password.trim()
            };
            
            // Usar el método específico para actualizar datos del usuario
            const updatedUser = await UsuariosService.updateUserData(usuario.id_usuario, dataToUpdate);
            toast.success('Usuario actualizado exitosamente', {
                duration: 2000,
                icon: '✅'
            });
            
            // Actualizar el estado local con todos los datos del usuario actualizado
            setUsuario(updatedUser);
            
            // Limpiar el campo de contraseña después de guardar exitosamente
            setFormData({
                nombre: updatedUser.nombre || '',
                email: updatedUser.email || '',
                rol: updatedUser.rol || '',
                password: '' // Limpiar para la próxima edición
            });

            // Redirigir a la lista de usuarios después de guardar
            setTimeout(() => {
                router.push('http://192.168.1.89:3000/dashboard/admin/usuarios');
            }, 2000); // Esperar 2 segundos para que el usuario vea el mensaje de éxito
            
        } catch (error) {
            console.error('Error updating usuario:', error);
            toast.error('Error al actualizar el usuario');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!usuario || updating) return;

        setUpdating(true);
        try {
            // Refrescar los datos del usuario desde el servidor
            const data = await UsuariosService.getById(usuario.id_usuario);
            setUsuario(data);
            
            // Actualizar SOLO los campos que no sean la contraseña
            // Preservar tanto el valor como el estado de "ha tocado el campo"
            setFormData(prevFormData => ({
                nombre: data.nombre || '',
                email: data.email || '',
                rol: data.rol || '',
                password: prevFormData.password // Mantener el valor actual del campo contraseña
            }));
            // No resetear hasPasswordInput aquí - preservar el estado de interacción del usuario
            
            toast.success('Datos del usuario actualizados desde el servidor', {
                duration: 3000,
                icon: '🔄'
            });
        } catch (error) {
            console.error('Error updating usuario data:', error);
            toast.error('Error al actualizar los datos del usuario');
        } finally {
            setUpdating(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAcceptSecurity = () => {
        setShowSecurityModal(false);
        setHasSeenSecurityWarning(true);
    };

    const handleRejectSecurity = () => {
        setShowSecurityModal(false);
        router.push(`http://192.168.1.89:3000/dashboard/admin/usuarios/${params.id}`);
    };

    const getRoleLabel = (role: string) => {
        const roles = {
            admin_general: 'Administrador General',
            solicitante: 'Solicitante',
            aprobador: 'Aprobador',
            pagador_banca: 'Pagador'
        };
        return roles[role as keyof typeof roles] || role;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}}>
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg">Cargando datos del usuario...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}}>
                <div className="text-white text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                    <p className="text-lg">{error}</p>
                    <Button
                        variant="outline"
                        className="mt-4 text-white border-white/30 hover:bg-white/10"
                        onClick={() => router.push('http://192.168.1.89:3000/dashboard/admin/usuarios')}
                    >
                        Volver a la lista
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute requiredRoles={['admin_general']}>
            <AdminLayout>
                <div className="max-w-6xl mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`http://192.168.1.89:3000/dashboard/admin/usuarios/${params.id}`)}
                                    className="text-white border-white/30 hover:bg-white/10"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Volver
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Editar Usuario</h1>
                                    <p className="text-white/80">Modificar información del usuario: {usuario?.nombre}</p>
                                </div>
                            </div>
                            
                            {/* Professional Toggle Switch for Block/Unblock */}
                            <div className="flex items-center space-x-6">
                                <div className="text-right">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className={`w-3 h-3 rounded-full ${
                                            usuario?.bloqueado ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                                        }`} />
                                        <p className="text-white text-sm font-semibold">
                                            Estado del Usuario
                                        </p>
                                    </div>
                                    <p className="text-white/70 text-xs">
                                        {usuario?.bloqueado ? 'Acceso denegado al sistema' : 'Acceso completo al sistema'}
                                    </p>
                                </div>
                                
                                {/* Botón para ir a gestión de acceso */}
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`http://192.168.1.89:3000/dashboard/admin/usuarios/${params.id}/access`)}
                                    className="text-white border-white/30 hover:bg-white/10 flex items-center space-x-2"
                                >
                                    {usuario?.bloqueado ? (
                                        <>
                                            <UserX className="w-4 h-4" />
                                            <span>Gestionar Acceso</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="w-4 h-4" />
                                            <span>Gestionar Acceso</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* User Info Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Información del Usuario</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleUpdate}
                                        disabled={updating}
                                        className="text-white border-white/30 hover:bg-white/10"
                                        title="Actualizar datos del usuario desde el servidor"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-white/70 text-sm">ID de Usuario</label>
                                        <p className="text-white font-medium">#{usuario?.id_usuario}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-white/70 text-sm">Rol Actual</label>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Shield className="w-4 h-4 text-blue-400" />
                                            <span className="text-white font-medium">{getRoleLabel(usuario?.rol || '')}</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-white/70 text-sm">Fecha de Creación</label>
                                        <p className="text-white">
                                            {usuario?.creado_en ? new Date(usuario.creado_en).toLocaleDateString('es-CO', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'No disponible'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-white/70 text-sm">Estado Actual</label>
                                        <div className="flex items-center space-x-2 mt-1">
                                            {usuario?.bloqueado ? (
                                                <UserX className="w-4 h-4 text-red-400" />
                                            ) : (
                                                <UserCheck className="w-4 h-4 text-green-400" />
                                            )}
                                            <span className={`font-medium ${usuario?.bloqueado ? 'text-red-400' : 'text-green-400'}`}>
                                                {usuario?.bloqueado ? 'Bloqueado' : 'Activo'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                                <h3 className="text-lg font-semibold text-white mb-6">Editar Información</h3>
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Nombre */}
                                        <div>
                                            <label className="block text-white font-medium mb-2">
                                                Nombre completo <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                value={formData.nombre || ''}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Ingrese el nombre completo"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-white font-medium mb-2">
                                                Correo electrónico <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email || ''}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="usuario@ejemplo.com"
                                            />
                                        </div>

                                        {/* Rol */}
                                        <div>
                                            <label className="block text-white font-medium mb-2">
                                                Rol del usuario <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                name="rol"
                                                value={formData.rol || ''}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">Seleccionar rol</option>
                                                <option value="admin_general">Administrador General</option>
                                                <option value="solicitante">Solicitante</option>
                                                <option value="aprobador">Aprobador</option>
                                                <option value="pagador_banca">Pagador</option>
                                            </select>
                                        </div>

                                        {/* Nueva Contraseña */}
                                        <div>
                                            <label className="block text-white font-medium mb-2">
                                                <Lock className="w-4 h-4 inline mr-2" />
                                                Nueva contraseña <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password || ''}
                                                onChange={handleInputChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                                                    formData.password && formData.password.length >= 6
                                                        ? 'border-green-300 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                                                        : 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                                                }`}
                                                placeholder="Nueva contraseña (obligatorio)"
                                                minLength={6}
                                                autoComplete="new-password"
                                            />
                                            <p className="text-white/60 text-xs mt-1">
                                                <span className="text-red-400 font-semibold">⚠️ OBLIGATORIO:</span> Por seguridad, debe establecer una nueva contraseña (mínimo 6 caracteres)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="text-white border-white/30 hover:bg-white/10 px-6"
                                            onClick={() => router.push(`http://192.168.1.89:3000/dashboard/admin/usuarios/${params.id}`)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={saving || !formData.password || formData.password.length < 6}
                                            className={`font-semibold px-8 py-3 rounded-xl ${
                                                formData.password && formData.password.length >= 6
                                                    ? 'bg-white hover:bg-gray-50'
                                                    : 'bg-gray-300 cursor-not-allowed'
                                            }`}
                                            style={{color: formData.password && formData.password.length >= 6 ? '#3B82F6' : '#6B7280'}}
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {formData.password && formData.password.length >= 6 
                                                        ? 'Guardar Cambios' 
                                                        : 'Contraseña Requerida'
                                                    }
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de Advertencia de Seguridad */}
                {showSecurityModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Política de Seguridad
                                </h3>
                                <div className="text-gray-600 mb-6 space-y-3">
                                    <p className="font-semibold text-red-600">
                                        ⚠️ ADVERTENCIA DE SEGURIDAD
                                    </p>
                                    <p>
                                        Por motivos de seguridad, <strong>es obligatorio cambiar la contraseña</strong> cada vez que se edite la información de un usuario.
                                    </p>
                                    <p>
                                        Esto garantiza la protección de las cuentas y el cumplimiento de las políticas de seguridad de la plataforma.
                                    </p>
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-4">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Requisitos:</strong> La nueva contraseña debe tener al menos 6 caracteres y no puede dejarse vacía.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        onClick={handleRejectSecurity}
                                        variant="outline"
                                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleAcceptSecurity}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Entendido, Continuar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </ProtectedRoute>
    );
}
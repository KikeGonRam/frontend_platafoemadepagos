'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Shield, UserCheck, UserX, Lock, Unlock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { UsuariosService } from '@/services/usuarios.service';
import { User as UserType } from '@/types';
import { toast } from 'react-hot-toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function UserAccessPage() {
    const params = useParams();
    const router = useRouter();
    const [usuario, setUsuario] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [togglingBlock, setTogglingBlock] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<{type: 'block' | 'unblock', newStatus: boolean} | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchUsuario(params.id as string);
        }
    }, [params.id]);

    const fetchUsuario = async (id: string) => {
        try {
            const data = await UsuariosService.getById(parseInt(id));
            setUsuario(data);
        } catch (error) {
            console.error('Error fetching usuario:', error);
            setError('Error al cargar los datos del usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAccess = async (isActive: boolean) => {
        if (!usuario) return;
        
        const newBlockedStatus = !isActive;
        const actionType = newBlockedStatus ? 'block' : 'unblock';
        
        // Mostrar modal de confirmación en lugar de ejecutar inmediatamente
        setPendingAction({ type: actionType, newStatus: newBlockedStatus });
        setShowConfirmModal(true);
    };

    const executeToggleAccess = async () => {
        if (!usuario || !pendingAction) return;
        
        setTogglingBlock(true);
        setShowConfirmModal(false);
        
        try {
            console.log('=== INICIO TOGGLE ACCESS ===');
            console.log('Usuario ID:', usuario.id_usuario);
            console.log('Estado actual en frontend:', usuario.bloqueado);
            console.log('Nuevo estado deseado:', pendingAction.newStatus);
            
            // NO actualizar el estado local inmediatamente - esperar respuesta del servidor
            console.log('Llamando al servidor...');
            const updatedUser = await UsuariosService.updateBlockStatus(usuario.id_usuario, pendingAction.newStatus);
            
            console.log('Respuesta completa del servidor:', updatedUser);
            console.log('Estado de bloqueo en respuesta:', updatedUser.bloqueado);
            
            // Verificar que el servidor realmente cambió el estado
            if (updatedUser.bloqueado !== pendingAction.newStatus) {
                console.error('❌ ERROR: El servidor no guardó el cambio correctamente');
                console.error('Esperado:', pendingAction.newStatus);
                console.error('Recibido:', updatedUser.bloqueado);
                throw new Error('El servidor no pudo procesar el cambio de estado');
            }
            
            console.log('✅ Servidor confirmó el cambio, actualizando UI...');
            
            // Solo actualizar el estado si el servidor confirmó el cambio
            setUsuario(updatedUser);
            
            // Verificación adicional después de 2 segundos para asegurar persistencia
            setTimeout(async () => {
                try {
                    console.log('=== VERIFICACIÓN POST-CAMBIO ===');
                    const verifyUser = await UsuariosService.getById(usuario.id_usuario);
                    console.log('Estado verificado desde BD:', verifyUser.bloqueado);
                    console.log('Estado esperado:', pendingAction.newStatus);
                    
                    if (verifyUser.bloqueado !== pendingAction.newStatus) {
                        console.error('❌ DISCREPANCIA: El estado en BD no coincide con lo esperado');
                        console.error('BD tiene:', verifyUser.bloqueado);
                        console.error('Esperábamos:', pendingAction.newStatus);
                        
                        // Actualizar con el estado real de la BD
                        setUsuario(verifyUser);
                        toast.error('El estado del usuario se revirtió. Revise la configuración del servidor.');
                    } else {
                        console.log('✅ Verificación exitosa: Estado persistido correctamente');
                    }
                } catch (error) {
                    console.error('Error en verificación:', error);
                }
            }, 2000);
            
            toast.success(
                `Usuario ${pendingAction.newStatus ? 'bloqueado' : 'desbloqueado'} correctamente`,
                {
                    icon: pendingAction.newStatus ? '🔒' : '✅',
                    duration: 4000
                }
            );
            
        } catch (error) {
            console.error('❌ Error en toggle access:', error);
            toast.error('Error al cambiar el estado de acceso del usuario');
            
            // Revertir a estado anterior en caso de error
            console.log('Revirtiendo a estado anterior...');
            const originalUser = await UsuariosService.getById(usuario.id_usuario);
            setUsuario(originalUser);
            
        } finally {
            setTogglingBlock(false);
            setPendingAction(null);
            console.log('=== FIN TOGGLE ACCESS ===');
        }
    };

    const cancelToggleAccess = () => {
        setShowConfirmModal(false);
        setPendingAction(null);
    };

    const handleRefreshUserStatus = async () => {
        if (!usuario || refreshing) return;
        
        setRefreshing(true);
        try {
            const refreshedUser = await UsuariosService.getById(usuario.id_usuario);
            setUsuario(refreshedUser);
            toast.success('Estado del usuario actualizado', {
                icon: '🔄',
                duration: 2000
            });
        } catch (error) {
            console.error('Error refreshing user:', error);
            toast.error('Error al actualizar el estado del usuario');
        } finally {
            setRefreshing(false);
        }
    };

    // Método alternativo usando el endpoint básico de update
    const executeToggleAccessAlternative = async () => {
        if (!usuario || !pendingAction) return;
        
        setTogglingBlock(true);
        setShowConfirmModal(false);
        
        try {
            console.log('=== MÉTODO ALTERNATIVO ===');
            console.log('Usando método update básico solo con campo bloqueado...');
            
            // Usar el método update básico con solo el campo bloqueado
            const updateData = { bloqueado: pendingAction.newStatus };
            console.log('Enviando solo:', updateData);
            
            const updatedUser = await UsuariosService.update(usuario.id_usuario, updateData);
            console.log('Respuesta del método alternativo:', updatedUser);
            
            // Actualizar estado
            setUsuario(updatedUser);
            
            toast.success(
                `Usuario ${pendingAction.newStatus ? 'bloqueado' : 'desbloqueado'} correctamente (método alternativo)`,
                {
                    icon: pendingAction.newStatus ? '🔒' : '✅',
                    duration: 4000
                }
            );
            
        } catch (error) {
            console.error('Error en método alternativo:', error);
            toast.error('Error al cambiar el estado de acceso del usuario');
        } finally {
            setTogglingBlock(false);
            setPendingAction(null);
        }
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
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
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
                <div className="max-w-4xl mx-auto px-6 py-8">
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
                                    Volver al Detalle
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-white flex items-center">
                                        <Shield className="w-6 h-6 mr-3" />
                                        Gestión de Acceso
                                    </h1>
                                    <p className="text-white/80">Controlar acceso al sistema para: {usuario?.nombre}</p>
                                </div>
                            </div>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefreshUserStatus}
                                disabled={refreshing}
                                className="text-white border-white/30 hover:bg-white/10"
                                title="Actualizar estado del usuario"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* User Info Card */}
                        <div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <UserCheck className="w-5 h-5 mr-2" />
                                    Información del Usuario
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-white/70 text-sm">ID de Usuario</label>
                                        <p className="text-white font-medium">#{usuario?.id_usuario}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-white/70 text-sm">Nombre</label>
                                        <p className="text-white font-medium">{usuario?.nombre}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-white/70 text-sm">Email</label>
                                        <p className="text-white font-medium">{usuario?.email}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-white/70 text-sm">Rol</label>
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
                                </div>
                            </div>
                        </div>

                        {/* Access Control Card */}
                        <div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                                    <Lock className="w-5 h-5 mr-2" />
                                    Control de Acceso
                                </h3>
                                
                                {/* Current Status */}
                                <div className="mb-8 p-4 rounded-xl" style={{backgroundColor: usuario?.bloqueado ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'}}>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className={`w-4 h-4 rounded-full ${
                                            usuario?.bloqueado ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                                        }`} />
                                        <p className="text-white font-semibold text-lg">
                                            Estado Actual: {usuario?.bloqueado ? 'Bloqueado' : 'Activo'}
                                        </p>
                                    </div>
                                    <p className="text-white/80 text-sm ml-7">
                                        {usuario?.bloqueado 
                                            ? 'El usuario no puede acceder al sistema' 
                                            : 'El usuario tiene acceso completo al sistema'
                                        }
                                    </p>
                                </div>

                                {/* Toggle Control */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex-1">
                                            <p className="text-white font-medium flex items-center">
                                                <Shield className="w-4 h-4 mr-2" />
                                                Acceso al Sistema
                                            </p>
                                            <p className="text-white/60 text-sm mt-1">
                                                Permitir o denegar el acceso del usuario al sistema
                                            </p>
                                        </div>
                                        
                                        <div className="ml-4">
                                            {/* Debug info mejorado */}
                                            <div className="text-xs text-white/70 mb-2 p-2 bg-black/20 rounded">
                                                <div>🔍 Estado Actual: <span className={usuario?.bloqueado ? 'text-red-300' : 'text-green-300'}>
                                                    {usuario?.bloqueado ? 'BLOQUEADO' : 'ACTIVO'}
                                                </span></div>
                                                <div>🎯 Toggle Checked: <span className={!usuario?.bloqueado ? 'text-green-300' : 'text-red-300'}>
                                                    {!usuario?.bloqueado ? 'TRUE' : 'FALSE'}
                                                </span></div>
                                                <div>⏱️ Última actualización: {new Date().toLocaleTimeString()}</div>
                                            </div>
                                            <ToggleSwitch
                                                checked={!usuario?.bloqueado}
                                                onChange={handleToggleAccess}
                                                loading={togglingBlock}
                                                size="lg"
                                                variant="success"
                                                labels={{
                                                    inactive: 'Bloqueado',
                                                    active: 'Activo'
                                                }}
                                                icons={{
                                                    active: <UserCheck className="w-full h-full" />,
                                                    inactive: <UserX className="w-full h-full" />
                                                }}
                                                description="Control de acceso al sistema"
                                            />
                                        </div>
                                    </div>

                                    {/* Warning Message */}
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                        <div className="flex items-start space-x-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                                            <div>
                                                <p className="text-amber-200 font-medium text-sm">Importante</p>
                                                <p className="text-amber-100/80 text-xs mt-1">
                                                    {usuario?.bloqueado 
                                                        ? 'Al desbloquear al usuario, podrá volver a acceder al sistema inmediatamente.'
                                                        : 'Al bloquear al usuario, perderá el acceso al sistema de forma inmediata y se cerrarán todas sus sesiones activas.'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-4 pt-6 mt-8 border-t border-white/20">
                                    <Button
                                        variant="outline"
                                        className="text-white border-white/30 hover:bg-white/10 px-6"
                                        onClick={() => router.push(`http://192.168.1.89:3000/dashboard/admin/usuarios/${params.id}/edit`)}
                                    >
                                        Editar Usuario
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="text-white border-white/30 hover:bg-white/10 px-6"
                                        onClick={() => router.push(`http://192.168.1.89:3000/dashboard/admin/usuarios/${params.id}`)}
                                    >
                                        Ver Detalle
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de Confirmación */}
                {showConfirmModal && pendingAction && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                            <div className="text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                    pendingAction.type === 'block' 
                                        ? 'bg-red-100' 
                                        : 'bg-green-100'
                                }`}>
                                    {pendingAction.type === 'block' ? (
                                        <UserX className="w-8 h-8 text-red-600" />
                                    ) : (
                                        <UserCheck className="w-8 h-8 text-green-600" />
                                    )}
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    {pendingAction.type === 'block' ? 'Bloquear Usuario' : 'Desbloquear Usuario'}
                                </h3>
                                
                                <div className="text-gray-600 mb-6 space-y-3">
                                    <p className="font-semibold">
                                        ¿Está seguro que desea {pendingAction.type === 'block' ? 'bloquear' : 'desbloquear'} a{' '}
                                        <span className="text-gray-900 font-bold">{usuario?.nombre}</span>?
                                    </p>
                                    
                                    {pendingAction.type === 'block' ? (
                                        <div className="bg-red-50 border-l-4 border-red-400 p-3">
                                            <p className="text-sm text-red-800">
                                                <strong>⚠️ Advertencia:</strong> El usuario perderá acceso al sistema inmediatamente 
                                                y se cerrarán todas sus sesiones activas.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border-l-4 border-green-400 p-3">
                                            <p className="text-sm text-green-800">
                                                <strong>✅ Información:</strong> El usuario recuperará acceso completo al sistema 
                                                y podrá iniciar sesión inmediatamente.
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4">
                                        <p className="text-sm text-blue-800">
                                            <strong>📋 Usuario:</strong> {usuario?.nombre} ({usuario?.email})
                                            <br />
                                            <strong>🛡️ Rol:</strong> {getRoleLabel(usuario?.rol || '')}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col space-y-2">
                                    <Button
                                        onClick={executeToggleAccess}
                                        disabled={togglingBlock}
                                        className={`w-full text-white ${
                                            pendingAction.type === 'block'
                                                ? 'bg-red-600 hover:bg-red-700'
                                                : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                    >
                                        {togglingBlock ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                {pendingAction.type === 'block' ? (
                                                    <>
                                                        <Lock className="w-4 h-4 mr-2" />
                                                        Confirmar Bloqueo (Método Completo)
                                                    </>
                                                ) : (
                                                    <>
                                                        <Unlock className="w-4 h-4 mr-2" />
                                                        Confirmar Desbloqueo (Método Completo)
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Button>
                                    
                                    <Button
                                        onClick={executeToggleAccessAlternative}
                                        disabled={togglingBlock}
                                        className={`w-full text-white ${
                                            pendingAction.type === 'block'
                                                ? 'bg-orange-600 hover:bg-orange-700'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {togglingBlock ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                {pendingAction.type === 'block' ? (
                                                    <>
                                                        <Lock className="w-4 h-4 mr-2" />
                                                        Probar Método Alternativo
                                                    </>
                                                ) : (
                                                    <>
                                                        <Unlock className="w-4 h-4 mr-2" />
                                                        Probar Método Alternativo
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Button>
                                    
                                    <Button
                                        onClick={cancelToggleAccess}
                                        variant="outline"
                                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                                        disabled={togglingBlock}
                                    >
                                        Cancelar
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

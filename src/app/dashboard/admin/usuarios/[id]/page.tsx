'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Shield, 
  AlertCircle, 
  Calendar,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Lock,
  Activity,
  Info,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UsuariosService } from '@/services/usuarios.service';
import { User as UserType } from '@/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { toast } from 'react-hot-toast';

export default function UsuarioDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [usuario, setUsuario] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsuario = useCallback(async (id: string) => {
        try {
            const data = await UsuariosService.getById(parseInt(id, 10));
            setUsuario(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching usuario:', error);
            setError('Error al cargar los detalles del usuario');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (params.id && typeof params.id === 'string') {
            fetchUsuario(params.id);
        }
    }, [params.id, fetchUsuario]);

    const handleRefresh = useCallback(async () => {
        if (!params.id || refreshing || typeof params.id !== 'string') return;
        
        setRefreshing(true);
        try {
            const data = await UsuariosService.getById(parseInt(params.id, 10));
            setUsuario(data);
            setError(null);
            toast.success('Estado del usuario actualizado correctamente', {
                duration: 3000,
                icon: '🔄'
            });
        } catch (error) {
            console.error('Error refreshing usuario:', error);
            setError('Error al actualizar los datos del usuario');
            toast.error('Error al actualizar los datos del usuario', {
                duration: 4000,
                icon: '❌'
            });
        } finally {
            setRefreshing(false);
        }
    }, [params.id, refreshing]);

    const getRoleLabel = useCallback((role: string) => {
        const roles: Record<string, string> = {
            admin_general: 'Administrador General',
            solicitante: 'Solicitante',
            aprobador: 'Aprobador',
            pagador_banca: 'Pagador'
        };
        return roles[role] || role;
    }, []);

    const getRoleColor = useCallback((role: string) => {
        const colors: Record<string, string> = {
            admin_general: 'bg-purple-500',
            solicitante: 'bg-blue-500',
            aprobador: 'bg-green-500',
            pagador_banca: 'bg-orange-500'
        };
        return colors[role] || 'bg-gray-500';
    }, []);

    const formatDate = useCallback((dateString: string) => {
        if (!dateString) return 'No disponible';
        try {
            return new Date(dateString).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Fecha inválida';
        }
    }, []);

    const getAccountStatus = useCallback(() => {
        if (!usuario) return { 
            text: 'Desconocido', 
            color: 'text-gray-400', 
            bgColor: 'bg-gray-100', 
            icon: AlertTriangle,
            description: 'Estado desconocido'
        };
        
        if (usuario.bloqueado) {
            return { 
                text: 'Bloqueado Permanentemente', 
                color: 'text-red-600', 
                bgColor: 'bg-red-100', 
                icon: UserX,
                description: 'El usuario no puede acceder al sistema'
            };
        }
        
        if (usuario.bloqueo_temporal_activado && usuario.bloqueo_temporal_fin) {
            const endDate = new Date(usuario.bloqueo_temporal_fin);
            const now = new Date();
            if (endDate > now) {
                return { 
                    text: 'Bloqueado Temporalmente', 
                    color: 'text-orange-600', 
                    bgColor: 'bg-orange-100', 
                    icon: Clock,
                    description: `Bloqueado hasta: ${formatDate(usuario.bloqueo_temporal_fin)}`
                };
            }
        }
        
        return { 
            text: 'Activo', 
            color: 'text-green-600', 
            bgColor: 'bg-green-100', 
            icon: UserCheck,
            description: 'El usuario tiene acceso completo al sistema'
        };
    }, [usuario, formatDate]);

    const getSecurityLevel = useCallback(() => {
        if (!usuario) return { level: 'Desconocido', color: 'text-gray-400' };
        
        if (usuario.intentos_fallidos >= 5) {
            return { level: 'Alto Riesgo', color: 'text-red-600' };
        } else if (usuario.intentos_fallidos >= 3) {
            return { level: 'Riesgo Medio', color: 'text-orange-600' };
        } else if (usuario.intentos_fallidos >= 1) {
            return { level: 'Riesgo Bajo', color: 'text-yellow-600' };
        }
        
        return { level: 'Seguro', color: 'text-green-600' };
    }, [usuario]);

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}}>
            <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Cargando detalles del usuario...</p>
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
                onClick={() => router.push('/dashboard/admin/usuarios')}
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
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('http://192.168.1.89:3000/dashboard/admin/usuarios')}
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Detalles del Usuario</h1>
                    <p className="text-white/80">Información completa del usuario</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="text-white border-white/30 hover:bg-white/10 px-4 py-2 transition-all duration-200"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Sincronizar con la base de datos para obtener el estado más reciente"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Sincronizando...' : 'Sincronizar Estado'}
                  </Button>
                  <Button
                    variant="outline"
                    className={`text-white border-white/30 hover:bg-white/10 px-4 py-2 transition-all duration-200 ${
                      usuario?.bloqueado 
                        ? 'border-red-400/50 bg-red-500/10 hover:bg-red-500/20' 
                        : 'border-green-400/50 bg-green-500/10 hover:bg-green-500/20'
                    }`}
                    onClick={() => router.push(`http://192.168.1.89:3000/dashboard/admin/usuarios/${params.id}/access`)}
                    title={`Estado actual: ${usuario?.bloqueado ? 'Usuario Bloqueado' : 'Usuario Activo'} - Click para gestionar acceso`}
                  >
                    <div className="flex items-center space-x-2">
                      {usuario?.bloqueado ? (
                        <UserX className="w-4 h-4 text-red-300" />
                      ) : (
                        <Shield className="w-4 h-4 text-green-300" />
                      )}
                      <span className="font-medium">
                        {usuario?.bloqueado ? 'Usuario Bloqueado' : 'Gestionar Acceso'}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        usuario?.bloqueado ? 'bg-red-400 animate-pulse' : 'bg-green-400'
                      }`} />
                    </div>
                  </Button>
                  <Button
                    className="bg-white hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    style={{color: '#3B82F6'}}
                    onClick={() => router.push(`http://192.168.1.89:3000/dashboard/admin/usuarios/${params.id}/edit`)}
                    title="Editar información personal del usuario (preserva todos los datos)"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Editar Usuario
                  </Button>
                </div>
              </div>
            </div>

            {/* User Details */}
            {usuario && (
                <div className="space-y-8">
                    {/* Data Protection Notice */}
                    <div className="bg-blue-500/10 backdrop-blur-sm rounded-2xl border border-blue-400/20 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Shield className="w-5 h-5 text-blue-300" />
                            </div>
                            <div className="flex-1">
                                <p className="text-blue-200 font-medium text-sm">
                                    🔒 Protección de Datos Garantizada
                                </p>
                                <p className="text-blue-100/80 text-xs mt-1">
                                    Todas las operaciones de bloqueo/desbloqueo preservan automáticamente los datos del usuario (nombre, email, rol, contraseña). 
                                    No se elimina información personal durante la gestión de acceso.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Overview Card */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                            <Activity className="w-6 h-6 mr-3" />
                            Estado General de la Cuenta
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Account Status */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    {(() => {
                                        const status = getAccountStatus();
                                        const Icon = status.icon;
                                        return (
                                            <>
                                                <div className={`p-2 rounded-lg ${status.bgColor}`}>
                                                    <Icon className={`w-5 h-5 ${status.color}`} />
                                                </div>
                                                <div>
                                                    <p className="text-white/70 text-sm">Estado de Acceso</p>
                                                    <p className={`font-semibold ${status.color.replace('text-', 'text-white')}`}>
                                                        {status.text}
                                                    </p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                                <p className="text-white/60 text-xs">
                                    {getAccountStatus().description}
                                </p>
                            </div>

                            {/* Security Level */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-2 rounded-lg bg-blue-100">
                                        <Shield className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-sm">Nivel de Seguridad</p>
                                        <p className={`font-semibold ${getSecurityLevel().color.replace('text-', 'text-white')}`}>
                                            {getSecurityLevel().level}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-white/60 text-xs">
                                    {usuario.intentos_fallidos} intento(s) fallido(s)
                                </p>
                            </div>

                            {/* Last Activity */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-2 rounded-lg bg-green-100">
                                        <Clock className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-sm">Última Actualización</p>
                                        <p className="font-semibold text-white">
                                            {formatDate(usuario.updated_at)}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-white/60 text-xs">
                                    Última modificación del perfil
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Personal Information */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                            <h2 className="text-xl font-semibold text-white border-b border-white/20 pb-3 mb-6 flex items-center">
                                <User className="w-6 h-6 mr-3" />
                                Información Personal
                            </h2>
                            
                            <div className="space-y-5">
                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white/70 text-sm mb-1">Nombre completo</p>
                                        <p className="text-white font-medium text-lg">{usuario.nombre}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Mail className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white/70 text-sm mb-1">Correo electrónico</p>
                                        <p className="text-white font-medium">{usuario.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white/70 text-sm mb-2">Rol del sistema</p>
                                        <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full text-white ${getRoleColor(usuario.rol)}`}>
                                            {getRoleLabel(usuario.rol)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Info className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white/70 text-sm mb-1">ID del Usuario</p>
                                        <p className="text-white font-mono text-lg">#{usuario.id_usuario}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security & Access Information */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                            <h2 className="text-xl font-semibold text-white border-b border-white/20 pb-3 mb-6 flex items-center">
                                <Lock className="w-6 h-6 mr-3" />
                                Seguridad y Acceso
                            </h2>
                            
                            <div className="space-y-5">
                                {/* Access Status */}
                                <div className="flex items-start space-x-4">
                                    {(() => {
                                        const status = getAccountStatus();
                                        const Icon = status.icon;
                                        return (
                                            <>
                                                <div className={`p-2 rounded-lg ${status.bgColor}`}>
                                                    <Icon className={`w-5 h-5 ${status.color}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white/70 text-sm mb-1">Estado de acceso</p>
                                                    <p className={`font-semibold text-lg ${status.color.replace('text-', 'text-white')}`}>
                                                        {status.text}
                                                    </p>
                                                    <p className="text-white/60 text-xs mt-1">
                                                        {status.description}
                                                    </p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Failed Attempts */}
                                <div className="flex items-start space-x-4">
                                    <div className={`p-2 rounded-lg ${usuario.intentos_fallidos > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                                        <AlertTriangle className={`w-5 h-5 ${usuario.intentos_fallidos > 0 ? 'text-red-600' : 'text-green-600'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white/70 text-sm mb-1">Intentos fallidos de acceso</p>
                                        <p className={`font-semibold text-lg ${usuario.intentos_fallidos > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            {usuario.intentos_fallidos} intentos
                                        </p>
                                        <p className="text-white/60 text-xs mt-1">
                                            {usuario.intentos_fallidos === 0 ? 'Sin intentos fallidos registrados' : 
                                             usuario.intentos_fallidos >= 5 ? 'Nivel de riesgo alto' :
                                             usuario.intentos_fallidos >= 3 ? 'Nivel de riesgo medio' : 'Nivel de riesgo bajo'}
                                        </p>
                                    </div>
                                </div>

                                {/* Temporary Block Status */}
                                {usuario.bloqueo_temporal_activado && (
                                    <div className="flex items-start space-x-4">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Clock className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white/70 text-sm mb-1">Bloqueo temporal</p>
                                            <p className="font-semibold text-lg text-orange-400">Activado</p>
                                            {usuario.bloqueo_temporal_fin && (
                                                <p className="text-white/60 text-xs mt-1">
                                                    Finaliza: {formatDate(usuario.bloqueo_temporal_fin)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Permanent Block Status */}
                                <div className="flex items-start space-x-4">
                                    <div className={`p-2 rounded-lg ${usuario.bloqueado ? 'bg-red-100' : 'bg-green-100'}`}>
                                        {usuario.bloqueado ? (
                                            <UserX className="w-5 h-5 text-red-600" />
                                        ) : (
                                            <UserCheck className="w-5 h-5 text-green-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white/70 text-sm mb-1">Bloqueo permanente</p>
                                        <p className={`font-semibold text-lg ${usuario.bloqueado ? 'text-red-400' : 'text-green-400'}`}>
                                            {usuario.bloqueado ? 'Bloqueado' : 'No bloqueado'}
                                        </p>
                                        <p className="text-white/60 text-xs mt-1">
                                            {usuario.bloqueado ? 'Usuario sin acceso al sistema' : 'Usuario con acceso normal'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps Information */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                        <h2 className="text-xl font-semibold text-white border-b border-white/20 pb-3 mb-6 flex items-center">
                            <Calendar className="w-6 h-6 mr-3" />
                            Información de Fechas
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white/70 text-sm mb-1">Fecha de creación</p>
                                    <p className="text-white font-medium">{formatDate(usuario.creado_en)}</p>
                                    <p className="text-white/60 text-xs mt-1">Cuando se registró en el sistema</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Clock className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white/70 text-sm mb-1">Última actualización</p>
                                    <p className="text-white font-medium">{formatDate(usuario.updated_at)}</p>
                                    <p className="text-white/60 text-xs mt-1">Última modificación del perfil</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
}

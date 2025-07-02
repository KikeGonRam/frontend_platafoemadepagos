'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Shield, AlertCircle, Calendar, Clock, ShieldOff, Eye, Edit, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UsuariosService } from '@/services/usuarios.service';
import { User as UserType } from '@/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function UsuarioDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [usuario, setUsuario] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        setError('Error al cargar los detalles del usuario');
        } finally {
        setLoading(false);
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

    const getRoleBadgeColor = (role: string) => {
        const colors = {
        admin_general: '#ef4444', // red
        solicitante: '#3b82f6', // blue
        aprobador: '#10b981', // green
        pagador_banca: '#f59e0b' // amber
        };
        return colors[role as keyof typeof colors] || '#6b7280';
    };

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
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white">Detalles del Usuario</h1>
                    <p className="text-white/80 text-lg mt-2">Información completa del usuario</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="text-white border-white/30 hover:bg-white/10 px-6 py-3"
                    onClick={() => router.push('/dashboard/admin/usuarios')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                  <Button
                    className="bg-white hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl"
                    style={{color: '#3B82F6'}}
                    onClick={() => router.push(`/dashboard/admin/usuarios/${params.id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Usuario
                  </Button>
                </div>
              </div>
            </div>

            {/* User Details */}
            {usuario && (
            <div className="space-y-8">
              {/* Status Card - Full Width */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {usuario.bloqueado ? (
                      <UserX className="w-16 h-16 text-red-400" />
                    ) : (
                      <UserCheck className="w-16 h-16 text-green-400" />
                    )}
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{usuario.nombre}</h2>
                      <p className="text-white/70 text-lg">{usuario.email}</p>
                      <span 
                        className="inline-flex px-4 py-2 text-sm font-semibold rounded-full text-white mt-3"
                        style={{backgroundColor: getRoleBadgeColor(usuario.rol)}}
                      >
                        {getRoleLabel(usuario.rol)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-6 py-3 text-lg font-semibold rounded-full ${
                      usuario.bloqueado 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {usuario.bloqueado ? 'Usuario Bloqueado' : 'Usuario Activo'}
                    </span>
                    <p className="text-white/60 text-lg mt-2">
                      ID: #{usuario.id_usuario}
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column - Personal Information */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                  <h2 className="text-2xl font-semibold text-white border-b border-white/20 pb-4 mb-6">
                    Información Personal
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-xl p-6">
                      <div className="flex items-center space-x-4">
                        <User className="w-6 h-6 text-white/70" />
                        <div className="flex-1">
                          <p className="text-white/70 text-sm mb-1">Nombre completo</p>
                          <p className="text-white font-medium text-xl">{usuario.nombre}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-6">
                      <div className="flex items-center space-x-4">
                        <Mail className="w-6 h-6 text-white/70" />
                        <div className="flex-1">
                          <p className="text-white/70 text-sm mb-1">Correo electrónico</p>
                          <p className="text-white font-medium text-xl break-all">{usuario.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-6">
                      <div className="flex items-center space-x-4">
                        <Shield className="w-6 h-6 text-white/70" />
                        <div className="flex-1">
                          <p className="text-white/70 text-sm mb-2">Rol del sistema</p>
                          <span 
                            className="inline-flex px-4 py-2 text-base font-semibold rounded-full text-white"
                            style={{backgroundColor: getRoleBadgeColor(usuario.rol)}}
                          >
                            {getRoleLabel(usuario.rol)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Status and Dates */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                  <h2 className="text-2xl font-semibold text-white border-b border-white/20 pb-4 mb-6">
                    Estado y Fechas
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-xl p-6">
                      <div className="flex items-center space-x-4">
                        {usuario.bloqueado ? (
                          <ShieldOff className="w-6 h-6 text-red-400" />
                        ) : (
                          <Shield className="w-6 h-6 text-green-400" />
                        )}
                        <div className="flex-1">
                          <p className="text-white/70 text-sm mb-2">Estado de acceso</p>
                          <span className={`inline-flex px-4 py-2 text-base font-semibold rounded-full ${
                            usuario.bloqueado 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {usuario.bloqueado ? 'Bloqueado' : 'Activo'}
                          </span>
                          <p className="text-white/60 text-sm mt-2">
                            {usuario.bloqueado 
                              ? 'Este usuario no puede acceder al sistema' 
                              : 'Este usuario puede acceder normalmente'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-6">
                      <div className="flex items-center space-x-4">
                        <Calendar className="w-6 h-6 text-white/70" />
                        <div className="flex-1">
                          <p className="text-white/70 text-sm mb-1">Fecha de registro</p>
                          <p className="text-white font-medium text-lg">
                            {usuario.created_at ? new Date(usuario.created_at).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'No disponible'}
                          </p>
                          <p className="text-white/60 text-sm mt-1">
                            {usuario.created_at ? new Date(usuario.created_at).toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-6">
                      <div className="flex items-center space-x-4">
                        <Clock className="w-6 h-6 text-white/70" />
                        <div className="flex-1">
                          <p className="text-white/70 text-sm mb-1">Última actualización</p>
                          <p className="text-white font-medium text-lg">
                            {usuario.updated_at ? new Date(usuario.updated_at).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'No disponible'}
                          </p>
                          <p className="text-white/60 text-sm mt-1">
                            {usuario.updated_at ? new Date(usuario.updated_at).toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Information - Full Width */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                <h3 className="text-2xl font-semibold text-white mb-6">Información Técnica</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-xl p-6 text-center">
                    <p className="text-white/70 text-sm mb-2">ID del Usuario</p>
                    <p className="text-white font-mono text-2xl font-bold">{usuario.id_usuario}</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-6 text-center">
                    <p className="text-white/70 text-sm mb-2">Días desde registro</p>
                    <p className="text-white font-mono text-2xl font-bold">
                      {usuario.created_at 
                        ? Math.floor((new Date().getTime() - new Date(usuario.created_at).getTime()) / (1000 * 60 * 60 * 24))
                        : 'N/A'
                      }
                    </p>
                    <p className="text-white/60 text-xs mt-1">días</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-6 text-center">
                    <p className="text-white/70 text-sm mb-2">Tipo de cuenta</p>
                    <p className="text-white font-medium text-lg">
                      {usuario.rol === 'admin_general' ? 'Administrador' : 'Usuario estándar'}
                    </p>
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
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SolicitanteLayout } from '@/components/layout/SolicitanteLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { User, Mail, Shield, Bell, Settings, Menu, LogOut, FileText, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function PerfilSolicitante() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const handleContactAdmin = () => {
        // Abrir correo electrónico del administrador
        window.location.href = `mailto:kikeramirez160418@gmail.com?subject=Solicitud de cambio de datos - Usuario ${user?.nombre}&body=Hola administrador,%0D%0A%0D%0ASoy ${user?.nombre} con rol de Solicitante. Necesito realizar los siguientes cambios en mi información:%0D%0A%0D%0A[Describa los cambios requeridos]%0D%0A%0D%0AGracias.`;
        toast.success('Abriendo su cliente de correo...');
    };

    return (
        <ProtectedRoute requiredRoles={['solicitante']}>
            <SolicitanteLayout>
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                        <div className="flex items-center space-x-6">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center ring-4 ring-white/30">
                                <span className="text-2xl font-bold text-white">
                                    {user?.nombre?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white font-montserrat">
                                    {user?.nombre}
                                </h2>
                                <p className="text-white/80">
                                    <span className="flex items-center">
                                        <Mail className="w-4 h-4 mr-2" />
                                        {user?.email}
                                    </span>
                                </p>
                                <p className="text-white/80 mt-1">
                                    <span className="flex items-center">
                                        <Shield className="w-4 h-4 mr-2" />
                                        Rol: Solicitante
                                    </span>
                                </p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100/20 text-green-300 mt-2">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Cuenta Activa
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Información Personal */}
                        <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                                <User className="w-5 h-5 mr-2 text-blue-300" />
                                Información Personal
                            </h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <p className="text-white/80 text-sm mb-2">Nombre completo:</p>
                                    <p className="text-white text-lg font-medium">{user?.nombre || 'No disponible'}</p>
                                </div>
                                
                                <div>
                                    <p className="text-white/80 text-sm mb-2">Correo electrónico:</p>
                                    <p className="text-white text-lg font-medium">{user?.email || 'No disponible'}</p>
                                </div>
                                
                                <div>
                                    <p className="text-white/80 text-sm mb-2">Rol en el sistema:</p>
                                    <p className="text-white text-lg font-medium flex items-center">
                                        <Shield className="w-4 h-4 mr-2 text-blue-300" />
                                        Solicitante
                                    </p>
                                </div>

                                <div>
                                    <p className="text-white/80 text-sm mb-2">Estado de la cuenta:</p>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100/20 text-green-300">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Activa
                                    </span>
                                </div>
                                
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                                    <h4 className="text-yellow-300 font-medium mb-2 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Información importante
                                    </h4>
                                    <p className="text-white/90 text-sm">
                                        Como solicitante, no puedes modificar tu información personal directamente. Para realizar cambios, debes contactar al administrador del sistema.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Contactar al Administrador */}
                        <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                                <Mail className="w-5 h-5 mr-2 text-blue-300" />
                                Contactar al Administrador
                            </h3>
                            
                            <div className="space-y-6">
                                <p className="text-white/80">
                                    ¿Necesitas cambiar tu información personal o tienes alguna consulta? Contacta directamente al administrador del sistema.
                                </p>

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                    <h4 className="text-blue-300 font-medium mb-2">¿Qué puedes solicitar?</h4>
                                    <ul className="text-white/90 text-sm space-y-1">
                                        <li>• Cambio de nombre</li>
                                        <li>• Cambio de correo electrónico</li>
                                        <li>• Restablecimiento de contraseña</li>
                                        <li>• Soporte técnico</li>
                                        <li>• Consultas sobre solicitudes</li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={handleContactAdmin}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-lg"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Enviar Correo al Administrador
                                </Button>

                                <p className="text-white/60 text-sm text-center">
                                    El correo se abrirá en tu cliente de correo predeterminado
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Configuraciones y Preferencias */}
                    <div className="mt-8">
                        <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                                <Settings className="w-5 h-5 mr-2 text-blue-300" />
                                Configuraciones
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-white font-medium mb-4 flex items-center">
                                        <Bell className="w-4 h-4 mr-2 text-blue-300" />
                                        Preferencias de Notificación
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <span className="text-white/80 text-sm">Notificaciones por correo</span>
                                            <span className="text-green-300 text-sm">Habilitadas</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <span className="text-white/80 text-sm">Alertas de estado de solicitudes</span>
                                            <span className="text-green-300 text-sm">Habilitadas</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <span className="text-white/80 text-sm">Recordatorios de seguimiento</span>
                                            <span className="text-green-300 text-sm">Habilitadas</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-white font-medium mb-4">Información de Acceso</h4>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-white/5 rounded-lg">
                                            <p className="text-white/80 text-sm">Última conexión</p>
                                            <p className="text-white font-medium">Sesión actual</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg">
                                            <p className="text-white/80 text-sm">Solicitudes creadas</p>
                                            <p className="text-white font-medium">Ver en dashboard</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/20">
                                <p className="text-white/60 text-sm text-center">
                                    Para modificar estas configuraciones, contacta al administrador del sistema
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </SolicitanteLayout>
        </ProtectedRoute>
    );
}
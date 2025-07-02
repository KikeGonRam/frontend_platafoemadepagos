'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Shield, Bell, Edit, Save, X, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UsuariosService, UpdateProfileData, ChangePasswordData } from '@/services/usuarios.service';
import { toast } from 'react-hot-toast';

interface TabType {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabType[] = [
  { id: 'personal', label: 'Información Personal', icon: <User className="w-4 h-4" /> },
  { id: 'seguridad', label: 'Seguridad', icon: <Shield className="w-4 h-4" /> },
  { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="w-4 h-4" /> }
];

export default function AdminProfilePage() {
  const { user, updateUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({ nombre: '', email: '', cargo: 'Administrador General' });

  useEffect(() => {
    if (user) {
      setFormData({ 
        nombre: user.nombre || '', 
        email: user.email || '', 
        cargo: 'Administrador General' 
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState({ solicitudesNuevas: true, solicitudesActualizadas: true, usuariosNuevos: false, reportesSemanal: true });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, checked: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: checked }));
  };

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.email.trim()) {
      toast.error('Nombre y correo no pueden estar vacíos');
      return;
    }

    setLoading(true);
    try {
      const profileData: UpdateProfileData = {
        nombre: formData.nombre,
        email: formData.email
      };

      const response = await UsuariosService.updateProfile(profileData);
      
      // Actualizar el contexto global PRIMERO
      if (updateUserData && typeof updateUserData === 'function') {
        updateUserData(response.user);
      }
      
      // NO actualizar el formData aquí, dejar que el useEffect lo haga
      // cuando detecte el cambio en el contexto user
      
      setIsEditing(false);
      toast.success(response.message || 'Información actualizada correctamente');
      
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { message?: string } })?.data?.message 
        : 'Error al actualizar la información';
      toast.error(errorMessage || 'Error al actualizar la información');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const changePasswordData: ChangePasswordData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      const response = await UsuariosService.changePassword(changePasswordData);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      toast.success(response.message || 'Contraseña actualizada correctamente');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { message?: string } })?.data?.message 
        : 'Error al actualizar la contraseña';
      toast.error(errorMessage || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Información Personal</h2>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={loading}
          className="bg-green-600 text-white hover:bg-green-700 shadow-lg border-0"
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar'}
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </>
          )}
        </Button>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/30">
            <span className="text-2xl font-bold text-white">
              {user?.nombre?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{formData.nombre || user?.nombre}</h3>
            <p className="text-white/80">{formData.cargo}</p>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Cuenta Verificada
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nombre completo
            </label>
            <Input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              disabled={!isEditing}
              className="bg-white/15 border-white/20 text-white"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Correo electrónico
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              className="bg-white/15 border-white/20 text-white"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Cargo
            </label>
            <Input
              type="text"
              value={formData.cargo}
              disabled
              className="bg-white/10 border-white/10 text-white cursor-not-allowed"
            />
            <p className="text-xs text-white/60 mt-1">El cargo no puede ser modificado</p>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-white/20">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="bg-gray-600 text-white border-gray-500 hover:bg-gray-700"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 text-white hover:bg-green-700 shadow-lg border-0"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Seguridad</h2>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            <Lock className="w-5 h-5 inline mr-2" />
            Contraseña
          </h3>
          {!showPasswordForm && (
            <Button
              onClick={() => setShowPasswordForm(true)}
              className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg border-0"
            >
              <Edit className="w-4 h-4 mr-2" />
              Cambiar Contraseña
            </Button>
          )}
        </div>

        {!showPasswordForm ? (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/70">
              Tu contraseña está protegida. Haz clic en "Cambiar Contraseña" para actualizarla.
            </p>
            <p className="text-white/60 text-sm mt-2">
              Última actualización: Hace 30 días
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Contraseña actual
                </label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="bg-white/15 border-white/20 text-white"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Nueva contraseña
                </label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="bg-white/15 border-white/20 text-white"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Confirmar nueva contraseña
                </label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="bg-white/15 border-white/20 text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-white/20">
              <Button
                variant="outline"
                onClick={handleCancelPasswordChange}
                className="bg-gray-600 text-white border-gray-500 hover:bg-gray-700"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handlePasswordUpdate}
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg border-0"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Actualizando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Notificaciones</h2>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Preferencias de Notificación</h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Nuevas solicitudes</p>
              <p className="text-white/70 text-sm">Recibir notificaciones cuando se cree una nueva solicitud</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.solicitudesNuevas}
                onChange={(e) => handleNotificationChange('solicitudesNuevas', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Solicitudes actualizadas</p>
              <p className="text-white/70 text-sm">Recibir notificaciones cuando se actualice una solicitud</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.solicitudesActualizadas}
                onChange={(e) => handleNotificationChange('solicitudesActualizadas', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Nuevos usuarios</p>
              <p className="text-white/70 text-sm">Recibir notificaciones cuando se registre un nuevo usuario</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.usuariosNuevos}
                onChange={(e) => handleNotificationChange('usuariosNuevos', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Reporte semanal</p>
              <p className="text-white/70 text-sm">Recibir un reporte semanal con estadísticas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.reportesSemanal}
                onChange={(e) => handleNotificationChange('reportesSemanal', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/20">
          <Button 
            onClick={() => toast.success('Preferencias guardadas')} 
            className="bg-purple-600 text-white hover:bg-purple-700 shadow-lg border-0"
          >
            Guardar Preferencias
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'seguridad':
        return renderSecurity();
      case 'notificaciones':
        return renderNotifications();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <ProtectedRoute requiredRoles={['admin_general']}>
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <h1 className="text-2xl font-bold text-white font-montserrat">Mi Perfil</h1>
            <p className="text-white/80">Gestiona tu información personal y preferencias</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-6 py-4 w-full text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
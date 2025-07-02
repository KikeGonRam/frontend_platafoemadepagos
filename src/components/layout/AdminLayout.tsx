'use client';

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { 
  LogOut, Home, Users, FileText, BarChart3, Menu, Bell, Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Memoize heavy components
const UserProfile = memo(({ user }: { user: any }) => (
  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-white/25 rounded-full flex items-center justify-center ring-2 ring-white/30">
        <span className="text-lg font-bold">{user?.nombre?.charAt(0).toUpperCase()}</span>
      </div>
      <div>
        <p className="font-semibold">{user?.nombre}</p>
        <p className="text-sm text-white/90">Administrador</p>
      </div>
    </div>
  </div>
));

const NavigationItem = memo(({ href, icon: Icon, children, pathname, onClick }: {
  href: string;
  icon: any;
  children: React.ReactNode;
  pathname: string;
  onClick: () => void;
}) => (
  <Link 
    href={href}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      pathname === href || pathname.startsWith(href + '/')
        ? 'bg-blue-50 text-blue-600 shadow-sm' 
        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
    }`}
    onClick={onClick}
  >
    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
    <span className="font-medium">{children}</span>
  </Link>
));

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const openLogout = useCallback(() => {
    setShowLogoutConfirm(true);
    setIsMenuOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setShowLogoutConfirm(false);
      setIsMenuOpen(false);
      router.push('/login');
      setTimeout(() => logout(), 100);
    } catch (error) {
      console.error("Error durante el cierre de sesión:", error);
      router.push('/login');
    }
  }, [logout, router]);

  return (
    <div className="min-h-screen font-sans" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}}>
      {/* Optimized Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(true)}
              className="bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25 transition-all duration-300 px-6 py-3 rounded-xl font-medium"
            >
              <Menu className="w-4 h-4 mr-2" />
              Menú
            </Button>
          </div>
        </div>
      </header>

      {/* Optimized Sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 backdrop-blur-sm transition-opacity duration-300" 
            onClick={closeMenu}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="flex flex-col h-full">
              <div className="text-white p-6" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Panel Administrativo</h2>
                </div>
                <UserProfile user={user} />
              </div>
              
              <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                <NavigationItem href="/dashboard/admin" icon={Home} pathname={pathname} onClick={closeMenu}>
                  Dashboard
                </NavigationItem>
                <NavigationItem href="/dashboard/admin/usuarios" icon={Users} pathname={pathname} onClick={closeMenu}>
                  Usuarios
                </NavigationItem>
                <NavigationItem href="/dashboard/admin/solicitudes" icon={FileText} pathname={pathname} onClick={closeMenu}>
                  Solicitudes
                </NavigationItem>
                <NavigationItem href="/dashboard/admin/reportes" icon={BarChart3} pathname={pathname} onClick={closeMenu}>
                  Reportes
                </NavigationItem>
                <NavigationItem href="/dashboard/admin/configuracion" icon={Settings} pathname={pathname} onClick={closeMenu}>
                  Configuración
                </NavigationItem>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={openLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 w-full group"
                >
                  <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Optimized Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4 z-[10000]">
            <LogOut className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Confirmar cierre de sesión</h3>
            <p className="text-gray-600 mb-6 text-center">¿Estás seguro de que deseas cerrar tu sesión?</p>
            
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowLogoutConfirm(false)}
                className="px-5"
              >
                Cancelar
              </Button>
              <Button 
                size="sm" 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-5"
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
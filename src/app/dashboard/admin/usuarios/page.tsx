'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { Users, Plus, Trash2, Edit, Eye, TrendingUp, Search, X } from 'lucide-react';
import { UsuariosService } from '@/services/usuarios.service';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { toast } from 'react-hot-toast';

// Simplify and inline components to reduce module complexity
export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // Simplified cache
  const cacheKey = 'usuarios_cache';
  const CACHE_TTL = 60000;

  // Simplified stats calculation
  const stats = useMemo(() => {
    const filteredUsers = user?.id_usuario 
      ? usuarios.filter(u => u.id_usuario !== parseInt(user.id_usuario.toString()))
      : usuarios;

    const total = filteredUsers.length;
    const roleCount = {
      admin_general: 0,
      solicitante: filteredUsers.filter(u => u.rol === 'solicitante').length,
      aprobador: filteredUsers.filter(u => u.rol === 'aprobador').length,
      pagador_banca: filteredUsers.filter(u => u.rol === 'pagador_banca').length
    };

    return { total, roleCount };
  }, [usuarios, user?.id_usuario]);

  // Simplified filtering
  const filteredUsers = useMemo(() => {
    let filtered = user?.id_usuario 
      ? usuarios.filter(u => u.id_usuario !== parseInt(user.id_usuario.toString()))
      : usuarios;
    
    if (roleFilter) {
      filtered = filtered.filter(u => u.rol === roleFilter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(u => 
        u.nombre.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [usuarios, roleFilter, searchTerm, user?.id_usuario]);

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedData: paginatedUsuarios,
    goToPage,
    changeItemsPerPage,
  } = usePagination({ data: filteredUsers, initialItemsPerPage: 5 });

  // Simplified fetch with better error handling
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setUsuarios(data);
          setLoading(false);
          return;
        }
      }

      const data = await UsuariosService.getAll();
      const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: sortedData,
        timestamp: Date.now()
      }));
      
      setUsuarios(sortedData);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Simplified handlers
  const handleExport = useCallback(async () => {
    try {
      const { exportUsuariosToCSV } = await import('@/utils/exportUtils');
      await exportUsuariosToCSV(filteredUsers);
      toast.success(`${filteredUsers.length} usuarios exportados`);
    } catch (error) {
      toast.error('Error al exportar usuarios');
    }
  }, [filteredUsers]);

  const getRoleLabel = (role: string) => {
    const roles = { solicitante: 'Solicitante', aprobador: 'Aprobador', pagador_banca: 'Pagador' };
    return roles[role as keyof typeof roles] || role;
  };

  return (
    <ProtectedRoute requiredRoles={['admin_general']}>
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Simplified header */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white font-montserrat">Gestión de Usuarios</h2>
                <p className="text-white/80">Administra usuarios del sistema ({stats.total} usuarios)</p>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" className="text-white border-white/30 hover:bg-white/10" onClick={handleExport}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button
                  className="bg-white hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl"
                  style={{color: '#3B82F6'}}
                  onClick={() => router.push('/dashboard/admin/usuarios/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Usuario
                </Button>
              </div>
            </div>
          </div>

          {/* Simplified search and filters */}
          <div className="bg-white rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">🔍 Buscar y Filtrar</h4>
            
            {/* Search bar */}
            <div className="mb-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Role filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setRoleFilter('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  roleFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todos ({stats.total})
              </button>
              {['solicitante', 'aprobador', 'pagador_banca'].map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    roleFilter === role ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {getRoleLabel(role)} ({stats.roleCount[role as keyof typeof stats.roleCount] || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Users table */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Cargando usuarios...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                <p className="text-gray-600 mb-4">Intenta ajustar los filtros de búsqueda</p>
                <Button onClick={() => { setRoleFilter(''); setSearchTerm(''); }}>
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedUsuarios.map((usuario) => (
                        <tr key={usuario.id_usuario} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{usuario.id_usuario}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{usuario.nombre}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{usuario.email}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {getRoleLabel(usuario.rol)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              usuario.bloqueado ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {usuario.bloqueado ? 'Inactivo' : 'Activo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/dashboard/admin/usuarios/${usuario.id_usuario}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/dashboard/admin/usuarios/${usuario.id_usuario}/edit`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(usuario);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-gray-50 px-6 py-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={goToPage}
                    onItemsPerPageChange={changeItemsPerPage}
                  />
                </div>
              </>
            )}
          </div>

          {/* Delete Modal */}
          <ConfirmDeleteModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={async () => {
              if (!selectedUser) return;
              setDeleting(true);
              try {
                await UsuariosService.delete(selectedUser.id_usuario);
                setUsuarios(prev => prev.filter(u => u.id_usuario !== selectedUser.id_usuario));
                sessionStorage.removeItem(cacheKey);
                toast.success('Usuario eliminado');
                setShowDeleteModal(false);
                setSelectedUser(null);
              } catch (error) {
                toast.error('Error al eliminar');
              } finally {
                setDeleting(false);
              }
            }}
            title="Eliminar Usuario"
            message="¿Estás seguro de que deseas eliminar este usuario?"
            itemName={selectedUser ? selectedUser.nombre : undefined}
            loading={deleting}
          />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { AdvancedFilters } from '@/components/ui/AdvancedFilters';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { FileText, Trash2, Edit, Eye, Search, Filter, X, Download, TrendingUp } from 'lucide-react';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { usePagination } from '@/hooks/usePagination';
import { useAdvancedFilters } from '@/hooks/useAdvancedFilters';
import { exportSolicitudesToCSV } from '@/utils/exportUtils';
import { useAuth } from '@/contexts/AuthContext';
import { Solicitud } from '@/types';
import { toast } from 'react-hot-toast';

export default function SolicitudesPage() {
  const router = useRouter();
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [departamentoFilter, setDepartamentoFilter] = useState('');
  const [montoMinimo, setMontoMinimo] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  
  const { user, logout } = useAuth();
  const { solicitudes, loading, deleteSolicitud } = useSolicitudes();

  // Custom filtering logic
  const filteredSolicitudes = useMemo(() => {
    let filtered = solicitudes;

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.id_solicitud.toString().includes(searchLower) ||
        (s.usuario_nombre && s.usuario_nombre.toLowerCase().includes(searchLower)) ||
        s.departamento.toLowerCase().includes(searchLower)
      );
    }

    // Estado filter
    if (estadoFilter) {
      filtered = filtered.filter(s => s.estado === estadoFilter);
    }

    // Departamento filter
    if (departamentoFilter) {
      filtered = filtered.filter(s => s.departamento === departamentoFilter);
    }

    // Monto mínimo filter
    if (montoMinimo) {
      const minAmount = parseFloat(montoMinimo);
      filtered = filtered.filter(s => s.monto >= minAmount);
    }

    // Fecha desde filter
    if (fechaDesde) {
      const fromDate = new Date(fechaDesde);
      filtered = filtered.filter(s => new Date(s.fecha_creacion) >= fromDate);
    }

    return filtered;
  }, [solicitudes, searchTerm, estadoFilter, departamentoFilter, montoMinimo, fechaDesde]);

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedData: paginatedSolicitudes,
    goToPage,
    changeItemsPerPage,
  } = usePagination({ data: filteredSolicitudes, initialItemsPerPage: 5 });

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setEstadoFilter('');
    setDepartamentoFilter('');
    setMontoMinimo('');
    setFechaDesde('');
    goToPage(1);
  };

  // Quick filter functions
  const applyQuickFilter = (type: string) => {
    clearFilters();
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    switch (type) {
      case 'pendientes':
        setEstadoFilter('pendiente');
        break;
      case 'autorizadas-hoy':
        setEstadoFilter('autorizada');
        setFechaDesde(today.toISOString().split('T')[0]);
        break;
      case 'monto-alto':
        setMontoMinimo('1000000');
        break;
      case 'esta-semana':
        setFechaDesde(weekAgo.toISOString().split('T')[0]);
        break;
      default:
        break;
    }
    goToPage(1);
  };

  const handleDelete = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedSolicitud) return;

    setDeleting(true);
    try {
      await deleteSolicitud(selectedSolicitud.id_solicitud);
      setShowDeleteModal(false);
      setSelectedSolicitud(null);
      toast.success('Solicitud eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting solicitud:', error);
      toast.error('Error al eliminar la solicitud');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    exportSolicitudesToCSV(filteredSolicitudes);
    toast.success(`${filteredSolicitudes.length} solicitudes exportadas`);
  };

  const getEstadoColor = (estado: string) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      autorizada: 'bg-green-100 text-green-800',
      rechazada: 'bg-red-100 text-red-800'
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <ProtectedRoute requiredRoles={['admin_general']}>
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white font-sans">
                  Gestión de Solicitudes
                </h2>
                <p className="text-white/80 text-lg mt-2">
                  Administra y supervisa todas las solicitudes del sistema
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="text-white border-white/30 hover:bg-white/10 px-6 py-3"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Total Solicitudes</p>
                  <p className="text-3xl font-bold text-white">{solicitudes.length}</p>
                  <p className="text-xs text-white/60 mt-1">En el sistema</p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <FileText className="w-8 h-8 text-blue-300" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-300">
                    {solicitudes.filter(s => s.estado === 'pendiente').length}
                  </p>
                  <p className="text-xs text-white/60 mt-1">Esperando revisión</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/20">
                  <FileText className="w-8 h-8 text-yellow-300" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Autorizadas</p>
                  <p className="text-3xl font-bold text-green-300">
                    {solicitudes.filter(s => s.estado === 'autorizada').length}
                  </p>
                  <p className="text-xs text-white/60 mt-1">Aprobadas</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/20">
                  <FileText className="w-8 h-8 text-green-300" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Rechazadas</p>
                  <p className="text-3xl font-bold text-red-300">
                    {solicitudes.filter(s => s.estado === 'rechazada').length}
                  </p>
                  <p className="text-xs text-white/60 mt-1">No aprobadas</p>
                </div>
                <div className="p-3 rounded-full bg-red-500/20">
                  <FileText className="w-8 h-8 text-red-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Functional Filters Section */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Filter className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-black">Filtros y Búsqueda</h4>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 border-red-900 hover:bg-red-50 font-medium"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-black mb-2">
                🔍 Búsqueda general
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white font-medium shadow-sm"
                  placeholder="Buscar por ID, solicitante, departamento..."
                  style={{
                    color: '#000000 !important',
                    backgroundColor: '#ffffff !important',
                    fontSize: '14px'
                  }}
                />
                {searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-blue-600 font-bold">
                  📊 Buscando: "{searchTerm}"
                </p>
              )}
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-black mb-2">📋 Estado</label>
                <select 
                  value={estadoFilter} 
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white font-medium shadow-sm"
                  style={{
                    color: '#000000 !important',
                    backgroundColor: '#ffffff !important'
                  }}
                >
                  <option value="" style={{color: '#000000', backgroundColor: '#ffffff'}}>Todos los estados</option>
                  <option value="pendiente" style={{color: '#000000', backgroundColor: '#ffffff'}}>Pendiente</option>
                  <option value="autorizada" style={{color: '#000000', backgroundColor: '#ffffff'}}>Autorizada</option>
                  <option value="rechazada" style={{color: '#000000', backgroundColor: '#ffffff'}}>Rechazada</option>
                  <option value="pagado" style={{color: '#000000', backgroundColor: '#ffffff'}}>Pagados</option>

                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">🏢 Departamento</label>
                <select 
                  value={departamentoFilter} 
                  onChange={(e) => setDepartamentoFilter(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white font-medium shadow-sm"
                  style={{
                    color: '#000000 !important',
                    backgroundColor: '#ffffff !important'
                  }}
                >
                  <option value="" style={{color: '#000000', backgroundColor: '#ffffff'}}>Todos los departamentos</option>
                  <option value="Tecnología" style={{color: '#000000', backgroundColor: '#ffffff'}}>Tecnología</option>
                  <option value="Recursos Humanos" style={{color: '#000000', backgroundColor: '#ffffff'}}>Recursos Humanos</option>
                  <option value="Finanzas" style={{color: '#000000', backgroundColor: '#ffffff'}}>Finanzas</option>
                  <option value="Marketing" style={{color: '#000000', backgroundColor: '#ffffff'}}>Marketing</option>
                  <option value="Contabilidad" style={{color: '#000000', backgroundColor: '#ffffff'}}>Contabilidad</option>
                  <option value="Facturación" style={{color: '#000000', backgroundColor: '#ffffff'}}>Facturación</option>
                  <option value="Cobranza" style={{color: '#000000', backgroundColor: '#ffffff'}}>Cobranza</option>
                  <option value="Vinculación" style={{color: '#000000', backgroundColor: '#ffffff'}}>Vinculación</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">💰 Monto mínimo</label>
                <input
                  type="number"
                  value={montoMinimo}
                  onChange={(e) => setMontoMinimo(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white font-medium shadow-sm"
                  placeholder="Ej: 50000"
                  style={{
                    color: '#000000 !important',
                    backgroundColor: '#ffffff !important'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">📅 Fecha desde</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white font-medium shadow-sm"
                  style={{
                    color: '#000000 !important',
                    backgroundColor: '#ffffff !important'
                  }}
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-black mb-3">⚡ Filtros rápidos</label>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => clearFilters()}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm"
                >
                  ✨ Todas
                </button>
                <button 
                  onClick={() => applyQuickFilter('pendientes')}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors shadow-sm border border-yellow-300"
                >
                  ⏳ Pendientes
                </button>
                <button 
                  onClick={() => applyQuickFilter('autorizadas-hoy')}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-green-100 text-green-800 hover:bg-green-200 transition-colors shadow-sm border border-green-300"
                >
                  ✅ Autorizadas Hoy
                </button>
                <button 
                  onClick={() => applyQuickFilter('monto-alto')}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors shadow-sm border border-purple-300"
                >
                  💎 Monto Alto
                </button>
                <button 
                  onClick={() => applyQuickFilter('esta-semana')}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors shadow-sm border border-gray-300"
                >
                  📆 Esta Semana
                </button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-900 font-bold">
                  📊 Mostrando {filteredSolicitudes.length} de {solicitudes.length} solicitudes
                </span>
                <span className="text-blue-700 font-medium">
                  Página {currentPage} de {totalPages}
                </span>
              </div>
            </div>
          </div>

          {/* Solicitudes Table */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6 font-sans">
                Lista de Solicitudes
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white">Cargando solicitudes...</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead style={{backgroundColor: '#F0F4FC'}}>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Solicitante
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Departamento
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedSolicitudes.map((solicitud) => (
                          <tr key={solicitud.id_solicitud} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{solicitud.id_solicitud}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {solicitud.usuario_nombre || `Usuario ${solicitud.id_usuario}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {solicitud.departamento}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(solicitud.monto)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(solicitud.estado)}`}>
                                {solicitud.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(solicitud.fecha_creacion).toLocaleDateString('es-CO')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/dashboard/admin/solicitudes/${solicitud.id_solicitud}`)}
                                style={{color: '#3B82F6', borderColor: '#3B82F6'}}
                                className="hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/dashboard/admin/solicitudes/${solicitud.id_solicitud}/edit`)}
                                style={{color: '#3B82F6', borderColor: '#3B82F6'}}
                                className="hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDelete(solicitud)}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{backgroundColor: '#F0F4FC'}} className="px-6 py-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      onPageChange={goToPage}
                      onItemsPerPageChange={changeItemsPerPage}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <ConfirmDeleteModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            title="Eliminar Solicitud"
            message="¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer."
            itemName={selectedSolicitud ? `Solicitud #${selectedSolicitud.id_solicitud} - ${selectedSolicitud.departamento}` : undefined}
            loading={deleting}
          />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
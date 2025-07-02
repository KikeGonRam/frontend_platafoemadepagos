'use client';

import React, { useState } from 'react';
import { Filter, X, Search, Download, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface FilterState {
  search: string;
  estado?: string;
  rol?: string;
  departamento?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  montoMin?: number;
  montoMax?: number;
  tipoPago?: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onExport?: () => void;
  onReset: () => void;
  type: 'usuarios' | 'solicitudes' | 'pagos' | 'pagosHistorial';
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onExport, 
  onReset, 
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });lue: any) => {
  };onFiltersChange({ ...filters, [key]: value });
  };
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== nulllue => 
  );value !== undefined && value !== '' && value !== null
  );
  const estadoOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'autorizada', label: 'Autorizada' },rounded-xl shadow-lg border border-white/20 mb-6 animate-slide-up">
    { value: 'rechazada', label: 'Rechazada' }
  ];  <div className="p-4 border-b border-white/20">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
  const rolOptions = [ principal */}
    { value: 'admin_general', label: 'Administrador' },uto">
    { value: 'solicitante', label: 'Solicitante' },1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
    { value: 'aprobador', label: 'Aprobador' },
    { value: 'pagador_banca', label: 'Pagador' }
  ];          placeholder={`Buscar ${type === 'usuarios' ? 'usuarios' : 'solicitudes'}...`}
              value={filters.search}
  const departamentoOptions = [updateFilter('search', e.target.value)}
    { value: 'Recursos Humanos', label: 'Recursos Humanos' },-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white shadow-sm font-medium"
    { value: 'Tecnología', label: 'Tecnología' },
    { value: 'Finanzas', label: 'Finanzas' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Operaciones', label: 'Operaciones' },
    { value: 'Legal', label: 'Legal' }
  ];        />
            {filters.search && (
  return (    <button
    <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 mb-6 animate-slide-up">
      {/* Header de filtros */}lute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      <div className="p-4 border-b border-white/20">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Búsqueda principal */}
          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <inputroles */}
              type="text""flex flex-wrap gap-2 items-center">
              placeholder={`Buscar ${type === 'usuarios' ? 'usuarios' : 'solicitudes'}...`}
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white shadow-sm font-medium"
              style={{ ={`flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 ${
                color: '#1f2937',? 'border-white/60 bg-white/30' : ''
                backgroundColor: '#ffffff',
                fontSize: '14px'
              }}ilter className="w-4 h-4" />
            /><span>Filtros</span>
            {filters.search && (&& (
              <button className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                onClick={() => updateFilter('search', '')}= undefined && v !== '' && v !== null).length}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >}
                <X className="h-5 w-5" />
              </button>
            )}nExport && (
          </div>utton
          {/* Controles */}tline"
          <div className="flex flex-wrap gap-2 items-center">
            <Buttonlick={onExport}
              variant="outline" items-center space-x-2 bg-green-500 text-white border-green-500 hover:bg-green-500"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 ${
                hasActiveFilters ? 'border-white/60 bg-white/30' : ''
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  {Object.values(filters).filter(v => v !== undefined && v !== '' && v !== null).length}
                </span>me="flex items-center space-x-2 bg-red-500 text-red-100 border-red-900 hover:bg-red-900"
              )}
            </Button>eshCw className="w-4 h-4" />
                <span>Limpiar</span>
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="flex items-center space-x-2 bg-green-500 text-white border-green-500 hover:bg-green-500"
              >os expandidos */}
                <Download className="w-4 h-4" />
                <span>Exportar</span>5 backdrop-blur-sm animate-fade-in">
              </Button>e="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            )}ype === 'usuarios' && (
              <div>
            {hasActiveFilters && (block text-sm font-medium text-white/80 mb-1">Rol</label>
              <Buttonct
                variant="outline"rol || ''}
                size="sm"e={(e) => updateFilter('rol', e.target.value || undefined)}
                onClick={onReset}ll px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm font-medium"
                className="flex items-center space-x-2 bg-red-500 text-red-100 border-red-900 hover:bg-red-900"
              >     color: '#1f2937',
                <RefreshCw className="w-4 h-4" />
                <span>Limpiar</span>
              </Button>
            )}    <option value="" style={{color: '#6b7280'}}>Todos los roles</option>
          </div>  <option value="admin_general" style={{color: '#1f2937'}}>Administrador</option>
        </div>    <option value="solicitante" style={{color: '#1f2937'}}>Solicitante</option>
      </div>      <option value="aprobador" style={{color: '#1f2937'}}>Aprobador</option>
                  <option value="pagador_banca" style={{color: '#1f2937'}}>Pagador</option>
      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="p-4 bg-white/5 backdrop-blur-sm animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {type === 'usuarios' && (& (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Rol</label>
                <select
                  value={filters.rol || ''}ext-sm font-medium text-gray-700 mb-2">
                  onChange={(e) => updateFilter('rol', e.target.value || undefined)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm font-medium"
                  style={{ 
                    color: '#1f2937',tado}
                    backgroundColor: '#ffffff'ter('estado', e.target.value)}
                  }}className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm font-medium"
                >   style={{ 
                  <option value="" style={{color: '#6b7280'}}>Todos los roles</option>
                  {rolOptions.map(option => (ff'
                    <option key={option.value} value={option.value} style={{color: '#1f2937'}}>
                      {option.label}
                    </option>alue="" style={{color: '#6b7280'}}>Todos los estados</option>
                  ))}option value="pendiente" style={{color: '#1f2937'}}>Pendiente</option>
                </select>on value="autorizada" style={{color: '#1f2937'}}>Autorizada</option>
              </div><option value="rechazada" style={{color: '#1f2937'}}>Rechazada</option>
            )}      <option value="pagada" style={{color: '#1f2937'}}>Pagada</option>
                  </select>
            {type === 'solicitudes' && (
              <>
                <div>epartamento Filter */}
                  <label className="block text-sm font-medium text-white/80 mb-1">Estado</label>
                  <selectclassName="block text-sm font-medium text-gray-700 mb-2">
                    value={filters.estado || ''}
                    onChange={(e) => updateFilter('estado', e.target.value || undefined)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm font-medium"
                    style={{ lters.departamento}
                      color: '#1f2937',dateFilter('departamento', e.target.value)}
                      backgroundColor: '#ffffff'border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm font-medium"
                    }}yle={{ 
                  >   color: '#1f2937',
                    <option value="" style={{color: '#6b7280'}}>Todos los estados</option>
                    {estadoOptions.map(option => (
                      <option key={option.value} value={option.value} style={{color: '#1f2937'}}>
                        {option.label}tyle={{color: '#6b7280'}}>Todos los departamentos</option>
                      </option>ue="contabilidad" style={{color: '#1f2937'}}>Contabilidad</option>
                    ))}tion value="facturacion" style={{color: '#1f2937'}}>Facturación</option>
                  </select> value="cobranza" style={{color: '#1f2937'}}>Cobranza</option>
                </div>ption value="vinculacion" style={{color: '#1f2937'}}>Vinculación</option>
                    <option value="administracion" style={{color: '#1f2937'}}>Administración</option>
                <div>option value="ti" style={{color: '#1f2937'}}>TI</option>
                  <label className="block text-sm font-medium text-white/80 mb-1">Departamento</label>on>
                  <selecton value="comercial" style={{color: '#1f2937'}}>Comercial</option>
                    value={filters.departamento || ''}" style={{color: '#1f2937'}}>Atención a Clientes</option>
                    onChange={(e) => updateFilter('departamento', e.target.value || undefined)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm font-medium"
                    style={{ 
                      color: '#1f2937',
                      backgroundColor: '#ffffff'
                    }}po de Pago Filter - Nuevo */}
                  >v>
                    <option value="" style={{color: '#6b7280'}}>Todos los departamentos</option>
                    {departamentoOptions.map(option => (
                      <option key={option.value} value={option.value} style={{color: '#1f2937'}}>
                        {option.label}
                      </option>ers.tipoPago || ''}
                    ))}hange={(e) => updateFilter('tipoPago', e.target.value)}
                  </select>me="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm font-medium"
                </div>yle={{ 
                      color: '#1f2937',
                <div> backgroundColor: '#ffffff'
                  <label className="block text-sm font-medium text-white/80 mb-1">Monto Mínimo</label>
                  <input
                    type="number"="" style={{color: '#6b7280'}}>Todos los tipos</option>
                    placeholder="0"viaticos" style={{color: '#1f2937'}}>Viáticos</option>
                    value={filters.montoMin || ''}={{color: '#1f2937'}}>Efectivo</option>
                    onChange={(e) => updateFilter('montoMin', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400 shadow-sm font-medium"
                    style={{ alue="tarjeta" style={{color: '#1f2937'}}>Tarjeta</option>
                      color: '#1f2937',eedores" style={{color: '#1f2937'}}>Proveedores</option>
                      backgroundColor: '#ffffff'os" style={{color: '#1f2937'}}>Administrativos</option>
                    }}lect>
                  />v>
                </div>
                <div>
                <div>bel className="block text-sm font-medium text-white/80 mb-1">Monto Mínimo</label>
                  <label className="block text-sm font-medium text-white/80 mb-1">Monto Máximo</label>
                  <input="number"
                    type="number"0"
                    placeholder="999999999" || ''}
                    value={filters.montoMax || ''}'montoMin', e.target.value ? Number(e.target.value) : undefined)}
                    onChange={(e) => updateFilter('montoMax', e.target.value ? Number(e.target.value) : undefined)}focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400 shadow-sm font-medium"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400 shadow-sm font-medium"
                    style={{ '#1f2937',
                      color: '#1f2937','#ffffff'
                      backgroundColor: '#ffffff'
                    }}
                  />v>
                </div>
              </>div>
            )}    <label className="block text-sm font-medium text-white/80 mb-1">Monto Máximo</label>
                  <input
            <div>   type="number"
              <label className="block text-sm font-medium text-white/80 mb-1">Fecha Desde</label>
              <inputvalue={filters.montoMax || ''}
                type="date"e={(e) => updateFilter('montoMax', e.target.value ? Number(e.target.value) : undefined)}
                value={filters.fechaDesde || ''}border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400 shadow-sm font-medium"
                onChange={(e) => updateFilter('fechaDesde', e.target.value || undefined)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm font-medium"
                style={{ kgroundColor: '#ffffff'
                  color: '#1f2937',
                  backgroundColor: '#ffffff'
                }}div>
              />>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={filters.fechaHasta || ''}
                onChange={(e) => updateFilter('fechaHasta', e.target.value || undefined)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm font-medium"
                style={{ 
                  color: '#1f2937',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          </div>
            <div>
          {/* Filtros activos */}lock text-sm font-medium text-white/80 mb-1">Fecha Hasta</label>
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-white/80 font-medium">Filtros activos:</span>
                {Object.entries(filters).map(([key, value]) => {00 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm font-medium"
                  if (!value) return null;
                  const labels = {color: '#1f2937',
                    search: 'Búsqueda',
                    estado: 'Estado',
                    departamento: 'Departamento',
                    tipoPago: 'Tipo de Pago', // Nuevo label
                    fechaDesde: 'Desde',
                    fechaHasta: 'Hasta',
                    montoMin: 'Monto mín',          {/* Filtros activos */}
                    montoMax: 'Monto máx's && (
                  };e="mt-4 pt-4 border-t border-white/20">
                  lex flex-wrap gap-2 items-center">
                  let displayValue = value.toString();
                  if (key === 'estado' && type === 'solicitudes') {ct.entries(filters).map(([key, value]) => {
                    displayValue = estadoOptions.find(o => o.value === value)?.label || value.toString();') return null;
                  } else if (key === 'rol' && type === 'usuarios') {
                    displayValue = rolOptions.find(o => o.value === value)?.label || value.toString();
                  }
playValue = estadoOptions.find(o => o.value === value)?.label || value.toString();
                  return (e === 'usuarios') {
                    <spane = rolOptions.find(o => o.value === value)?.label || value.toString();
                      key={key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-200 text-blue-900 border border-blue-300"
                    >eturn (
                      {labels[key as keyof FilterState]}: {displayValue}<span
                      <button    key={key}
                        onClick={() => updateFilter(key as keyof FilterState, undefined)}          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-200 text-blue-900 border border-blue-300"
                        className="ml-2 hover:text-blue-700 font-bold"      >
                      >              {key}: {displayValue}
                        <X className="w-3 h-3" />            <button
                      </button>                    onClick={() => updateFilter(key as keyof FilterState, undefined)}
                    </span>                       className="ml-2 hover:text-blue-700 font-bold"
                  );                      >










}  );    </div>      )}        </div>          )}            </div>              </div>                })}                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import Button from '../common/Button';
import { useDebounce } from '../../hooks/useDebounce';

const TripsTable = ({ trips = [], users = [], onEdit, onDelete, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('fechaInicio');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const user = users.find(u => u.id === trip.usuarioId);
      const userName = user?.nombre || '';
      
      const matchesSearch = 
        trip.destino.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        trip.motivo.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || trip.estado === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [trips, users, debouncedSearchTerm, statusFilter]);

  const sortedTrips = useMemo(() => {
    return [...filteredTrips].sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === 'usuario') {
        const userA = users.find(u => u.id === a.usuarioId);
        const userB = users.find(u => u.id === b.usuarioId);
        aValue = userA?.nombre || '';
        bValue = userB?.nombre || '';
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }
      
      // Manejar fechas y números
      if (sortField.includes('fecha')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredTrips, users, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      aprobado: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobado' },
      en_proceso: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En Proceso' },
      finalizado: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Finalizado' },
      cancelado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' }
    };
    
    const config = statusConfig[status] || statusConfig.pendiente;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar viajes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="en_proceso">En Proceso</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          
          <div className="text-sm text-gray-600">
            {sortedTrips.length} de {trips.length} viajes
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white shadow-sm rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('destino')}
              >
                <div className="flex items-center space-x-1">
                  <span>Destino</span>
                  <span className="text-gray-400">{getSortIcon('destino')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('usuario')}
              >
                <div className="flex items-center space-x-1">
                  <span>Usuario</span>
                  <span className="text-gray-400">{getSortIcon('usuario')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('fechaInicio')}
              >
                <div className="flex items-center space-x-1">
                  <span>Fechas</span>
                  <span className="text-gray-400">{getSortIcon('fechaInicio')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('presupuesto')}
              >
                <div className="flex items-center space-x-1">
                  <span>Presupuesto</span>
                  <span className="text-gray-400">{getSortIcon('presupuesto')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('estado')}
              >
                <div className="flex items-center space-x-1">
                  <span>Estado</span>
                  <span className="text-gray-400">{getSortIcon('estado')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTrips.map((trip) => {
              const user = users.find(u => u.id === trip.usuarioId);
              return (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{trip.destino}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs" title={trip.motivo}>
                      {trip.motivo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user?.nombre || 'Usuario no encontrado'}</div>
                    <div className="text-sm text-gray-500">{user?.cargo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(trip.fechaInicio)}</div>
                    <div className="text-sm text-gray-500">al {formatDate(trip.fechaFin)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(trip.presupuesto)}</div>
                    <div className="text-sm text-gray-500">Viático: {formatCurrency(trip.viaticoDiario)}/día</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(trip.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(trip)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(trip.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedTrips.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {trips.length === 0 ? 'No hay viajes registrados' : 'No se encontraron viajes'}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsTable;
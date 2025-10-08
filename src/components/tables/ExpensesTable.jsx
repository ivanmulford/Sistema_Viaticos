import React, { useState, useMemo } from 'react';
import Button from '../common/Button';
import { useDebounce } from '../../hooks/useDebounce';

const ExpensesTable = ({ expenses = [], trips = [], users = [], onEdit, onDelete, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [sortField, setSortField] = useState('fecha');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const trip = trips.find(t => t.id === expense.viajeId);
      const user = users.find(u => u.id === trip?.usuarioId);
      
      const matchesSearch = 
        expense.concepto.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        trip?.destino.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user?.nombre.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        expense.categoria.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || expense.categoria === categoryFilter;
      
      const matchesApproval = approvalFilter === '' || 
        (approvalFilter === 'aprobado' && expense.aprobado) ||
        (approvalFilter === 'pendiente' && !expense.aprobado);
      
      return matchesSearch && matchesCategory && matchesApproval;
    });
  }, [expenses, trips, users, debouncedSearchTerm, categoryFilter, approvalFilter]);

  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === 'viaje') {
        const tripA = trips.find(t => t.id === a.viajeId);
        const tripB = trips.find(t => t.id === b.viajeId);
        aValue = tripA?.destino || '';
        bValue = tripB?.destino || '';
      } else if (sortField === 'usuario') {
        const tripA = trips.find(t => t.id === a.viajeId);
        const tripB = trips.find(t => t.id === b.viajeId);
        const userA = users.find(u => u.id === tripA?.usuarioId);
        const userB = users.find(u => u.id === tripB?.usuarioId);
        aValue = userA?.nombre || '';
        bValue = userB?.nombre || '';
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }
      
      // Manejar fechas y números
      if (sortField === 'fecha') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortField === 'monto') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
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
  }, [filteredExpenses, trips, users, sortField, sortDirection]);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getTotalExpenses = () => {
    return sortedExpenses.reduce((total, expense) => total + expense.monto, 0);
  };

  const getApprovedExpenses = () => {
    return sortedExpenses
      .filter(expense => expense.aprobado)
      .reduce((total, expense) => total + expense.monto, 0);
  };

  const categories = [...new Set(expenses.map(expense => expense.categoria))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-600">Total de Gastos</div>
          <div className="text-2xl font-bold text-blue-900">{formatCurrency(getTotalExpenses())}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-green-600">Gastos Aprobados</div>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(getApprovedExpenses())}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-yellow-600">Gastos Pendientes</div>
          <div className="text-2xl font-bold text-yellow-900">
            {formatCurrency(getTotalExpenses() - getApprovedExpenses())}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar gastos..."
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
        
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="aprobado">Aprobados</option>
            <option value="pendiente">Pendientes</option>
          </select>
          
          <div className="text-sm text-gray-600">
            {sortedExpenses.length} de {expenses.length} gastos
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
                onClick={() => handleSort('fecha')}
              >
                <div className="flex items-center space-x-1">
                  <span>Fecha</span>
                  <span className="text-gray-400">{getSortIcon('fecha')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('concepto')}
              >
                <div className="flex items-center space-x-1">
                  <span>Concepto</span>
                  <span className="text-gray-400">{getSortIcon('concepto')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('viaje')}
              >
                <div className="flex items-center space-x-1">
                  <span>Viaje</span>
                  <span className="text-gray-400">{getSortIcon('viaje')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('categoria')}
              >
                <div className="flex items-center space-x-1">
                  <span>Categoría</span>
                  <span className="text-gray-400">{getSortIcon('categoria')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('monto')}
              >
                <div className="flex items-center space-x-1">
                  <span>Monto</span>
                  <span className="text-gray-400">{getSortIcon('monto')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedExpenses.map((expense) => {
              const trip = trips.find(t => t.id === expense.viajeId);
              const user = users.find(u => u.id === trip?.usuarioId);
              return (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(expense.fecha)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{expense.concepto}</div>
                    {expense.comprobante && (
                      <div className="text-sm text-gray-500">Comp: {expense.comprobante}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trip?.destino || 'Viaje no encontrado'}</div>
                    <div className="text-sm text-gray-500">{user?.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {expense.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(expense.monto)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      expense.aprobado 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {expense.aprobado ? 'Aprobado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(expense)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(expense.id)}
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

      {sortedExpenses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {expenses.length === 0 ? 'No hay gastos registrados' : 'No se encontraron gastos'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesTable;
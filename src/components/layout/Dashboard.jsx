import React from 'react';

const Dashboard = ({ users, trips, expenses }) => {
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.activo).length,
    totalTrips: trips.length,
    pendingTrips: trips.filter(trip => trip.estado === 'pendiente').length,
    approvedTrips: trips.filter(trip => trip.estado === 'aprobado').length,
    totalExpenses: expenses.reduce((sum, expense) => sum + expense.monto, 0),
    approvedExpenses: expenses.filter(expense => expense.aprobado).reduce((sum, expense) => sum + expense.monto, 0),
    pendingExpenses: expenses.filter(expense => !expense.aprobado).length
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const recentTrips = trips
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    .slice(0, 5);

  const recentExpenses = expenses
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-green-600">{stats.activeUsers} activos</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Viajes Totales</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTrips}</p>
              <p className="text-sm text-yellow-600">{stats.pendingTrips} pendientes</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Gastos Totales</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
              <p className="text-sm text-green-600">{formatCurrency(stats.approvedExpenses)} aprobados</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Gastos Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingExpenses}</p>
              <p className="text-sm text-red-600">Por aprobar</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Viajes recientes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Viajes Recientes</h3>
          <div className="space-y-3">
            {recentTrips.length > 0 ? (
              recentTrips.map((trip) => {
                const user = users.find(u => u.id === trip.usuarioId);
                return (
                  <div key={trip.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{trip.destino}</p>
                      <p className="text-xs text-gray-500">{user?.nombre} - {trip.fechaInicio}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      trip.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                      trip.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {trip.estado}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No hay viajes registrados</p>
            )}
          </div>
        </div>

        {/* Gastos recientes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos Recientes</h3>
          <div className="space-y-3">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => {
                const trip = trips.find(t => t.id === expense.viajeId);
                return (
                  <div key={expense.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{expense.concepto}</p>
                      <p className="text-xs text-gray-500">{trip?.destino} - {expense.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(expense.monto)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        expense.aprobado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {expense.aprobado ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No hay gastos registrados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import { NotificationProvider } from './context/NotificationContext';
import NotificationContainer from './components/common/NotificationContainer';
import Button from './components/common/Button';
import Modal from './components/common/Modal';
import Dashboard from './components/layout/Dashboard';
import UsersTable from './components/tables/UsersTable';
import TripsTable from './components/tables/TripsTable';
import ExpensesTable from './components/tables/ExpensesTable';
import UserForm from './components/forms/UserForm';
import TripForm from './components/forms/TripForm';
import ExpenseForm from './components/forms/ExpenseForm';
import { useViaticos } from './hooks/useViaticos';

const ViaticosSystemContent = () => {
  const {
    users,
    trips,
    expenses,
    loading,
    lastSync,
    addUser,
    updateUser,
    deleteUser,
    addTrip,
    updateTrip,
    deleteTrip,
    addExpense,
    updateExpense,
    deleteExpense,
    loadFromSheets,
    clearAllData
  } = useViaticos();

  // Estados para modales
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // Funciones para manejar usuarios
  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleUserSubmit = (userData) => {
    if (editingUser) {
      updateUser(editingUser.id, userData);
    } else {
      addUser(userData);
    }
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      deleteUser(userId);
    }
  };

  // Funciones para manejar viajes
  const handleAddTrip = () => {
    setEditingTrip(null);
    setShowTripModal(true);
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setShowTripModal(true);
  };

  const handleTripSubmit = (tripData) => {
    if (editingTrip) {
      updateTrip(editingTrip.id, tripData);
    } else {
      addTrip(tripData);
    }
    setShowTripModal(false);
    setEditingTrip(null);
  };

  const handleDeleteTrip = (tripId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este viaje? También se eliminarán todos los gastos asociados.')) {
      deleteTrip(tripId);
    }
  };

  // Funciones para manejar gastos
  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowExpenseModal(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseModal(true);
  };

  const handleExpenseSubmit = (expenseData) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    setShowExpenseModal(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      deleteExpense(expenseId);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
      clearAllData();
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'users', name: 'Usuarios', icon: '👥' },
    { id: 'trips', name: 'Viajes', icon: '✈️' },
    { id: 'expenses', name: 'Gastos', icon: '💰' }
  ];

  const formatLastSync = (lastSyncDate) => {
    if (!lastSyncDate) return 'Nunca';
    return new Date(lastSyncDate).toLocaleString('es-ES');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationContainer />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Viáticos</h1>
              {lastSync && (
                <div className="ml-4 text-sm text-gray-500">
                  Última sincronización: {formatLastSync(lastSync)}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={loadFromSheets}
                loading={loading}
                disabled={loading}
              >
                🔄 Sincronizar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleClearAllData}
              >
                🗑️ Limpiar Todo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación de tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de tabs */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <Dashboard users={users} trips={trips} expenses={expenses} />
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Gestión de Usuarios</h2>
                <Button onClick={handleAddUser}>
                  + Agregar Usuario
                </Button>
              </div>
              <UsersTable
                users={users}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                loading={loading}
              />
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Gestión de Viajes</h2>
                <Button onClick={handleAddTrip}>
                  + Agregar Viaje
                </Button>
              </div>
              <TripsTable
                trips={trips}
                users={users}
                onEdit={handleEditTrip}
                onDelete={handleDeleteTrip}
                loading={loading}
              />
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Gestión de Gastos</h2>
                <Button onClick={handleAddExpense}>
                  + Agregar Gasto
                </Button>
              </div>
              <ExpensesTable
                expenses={expenses}
                trips={trips}
                users={users}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Editar Usuario' : 'Agregar Usuario'}
        size="md"
      >
        <UserForm
          user={editingUser}
          onSubmit={handleUserSubmit}
          onCancel={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          loading={loading}
        />
      </Modal>

      <Modal
        isOpen={showTripModal}
        onClose={() => {
          setShowTripModal(false);
          setEditingTrip(null);
        }}
        title={editingTrip ? 'Editar Viaje' : 'Agregar Viaje'}
        size="lg"
      >
        <TripForm
          trip={editingTrip}
          users={users}
          onSubmit={handleTripSubmit}
          onCancel={() => {
            setShowTripModal(false);
            setEditingTrip(null);
          }}
          loading={loading}
        />
      </Modal>

      <Modal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? 'Editar Gasto' : 'Agregar Gasto'}
        size="lg"
      >
        <ExpenseForm
          expense={editingExpense}
          trips={trips}
          onSubmit={handleExpenseSubmit}
          onCancel={() => {
            setShowExpenseModal(false);
            setEditingExpense(null);
          }}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

const ViaticosSystem = () => {
  return (
    <NotificationProvider>
      <ViaticosSystemContent />
    </NotificationProvider>
  );
};

export default ViaticosSystem;
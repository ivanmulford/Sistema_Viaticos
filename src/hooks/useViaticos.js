import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useNotification } from '../context/NotificationContext';
import googleSheetsService from '../services/googleSheetsService';

export const useViaticos = () => {
  const [users, setUsers] = useLocalStorage('viaticos_users', []);
  const [trips, setTrips] = useLocalStorage('viaticos_trips', []);
  const [expenses, setExpenses] = useLocalStorage('viaticos_expenses', []);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useLocalStorage('viaticos_last_sync', null);
  
  const { showSuccess, showError, showInfo } = useNotification();

  // Cargar datos desde Google Sheets
  const loadFromSheets = useCallback(async () => {
    setLoading(true);
    try {
      showInfo('Sincronizando datos con Google Sheets...');
      
      const data = await googleSheetsService.getAllData();
      
      if (data.users.length > 0 || data.trips.length > 0 || data.expenses.length > 0) {
        setUsers(data.users);
        setTrips(data.trips);
        setExpenses(data.expenses);
        setLastSync(new Date().toISOString());
        
        showSuccess(`Datos sincronizados: ${data.users.length} usuarios, ${data.trips.length} viajes, ${data.expenses.length} gastos`);
      } else {
        showInfo('No se encontraron datos en Google Sheets');
      }
      
    } catch (error) {
      console.error('Error al cargar desde Sheets:', error);
      showError(`Error al sincronizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [setUsers, setTrips, setExpenses, setLastSync, showSuccess, showError, showInfo]);

  // Cargar datos al iniciar
  useEffect(() => {
    if (!lastSync || users.length === 0) {
      loadFromSheets();
    }
  }, []);

  // Funciones para usuarios
  const addUser = (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      fechaCreacion: new Date().toISOString(),
      activo: true
    };
    setUsers(prev => [...prev, newUser]);
    showSuccess('Usuario agregado correctamente');
    return newUser;
  };

  const updateUser = (id, userData) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...userData } : user
    ));
    showSuccess('Usuario actualizado correctamente');
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    showSuccess('Usuario eliminado correctamente');
  };

  // Funciones para viajes
  const addTrip = (tripData) => {
    const newTrip = {
      id: trips.length + 1,
      ...tripData,
      fechaCreacion: new Date().toISOString(),
      estado: 'pendiente'
    };
    setTrips(prev => [...prev, newTrip]);
    showSuccess('Viaje agregado correctamente');
    return newTrip;
  };

  const updateTrip = (id, tripData) => {
    setTrips(prev => prev.map(trip => 
      trip.id === id ? { ...trip, ...tripData } : trip
    ));
    showSuccess('Viaje actualizado correctamente');
  };

  const deleteTrip = (id) => {
    setTrips(prev => prev.filter(trip => trip.id !== id));
    // También eliminar gastos asociados
    setExpenses(prev => prev.filter(expense => expense.viajeId !== id));
    showSuccess('Viaje eliminado correctamente');
  };

  // Funciones para gastos
  const addExpense = (expenseData) => {
    const newExpense = {
      id: expenses.length + 1,
      ...expenseData,
      fechaCreacion: new Date().toISOString(),
      aprobado: false
    };
    setExpenses(prev => [...prev, newExpense]);
    showSuccess('Gasto agregado correctamente');
    return newExpense;
  };

  const updateExpense = (id, expenseData) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...expenseData } : expense
    ));
    showSuccess('Gasto actualizado correctamente');
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    showSuccess('Gasto eliminado correctamente');
  };

  // Función para limpiar todos los datos
  const clearAllData = () => {
    setUsers([]);
    setTrips([]);
    setExpenses([]);
    setLastSync(null);
    showSuccess('Todos los datos han sido eliminados');
  };

  return {
    // Estado
    users,
    trips,
    expenses,
    loading,
    lastSync,
    
    // Acciones de usuarios
    addUser,
    updateUser,
    deleteUser,
    
    // Acciones de viajes
    addTrip,
    updateTrip,
    deleteTrip,
    
    // Acciones de gastos
    addExpense,
    updateExpense,
    deleteExpense,
    
    // Utilidades
    loadFromSheets,
    clearAllData
  };
};
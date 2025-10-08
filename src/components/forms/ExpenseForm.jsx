import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useViaticos } from '../../hooks/useViaticos';
import Button from '../common/Button';
import Input from '../common/Input';

const ExpenseForm = ({ expense = null, onSuccess, onCancel }) => {
  const { showNotification } = useNotification();
  const { trips, createExpense, updateExpense } = useViaticos();
  
  const [formData, setFormData] = useState({
    tripId: '',
    category: '',
    description: '',
    amount: '',
    date: '',
    receipt: '',
    status: 'Pendiente'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        tripId: expense.tripId || '',
        category: expense.category || '',
        description: expense.description || '',
        amount: expense.amount || '',
        date: expense.date || '',
        receipt: expense.receipt || '',
        status: expense.status || 'Pendiente'
      });
    }
  }, [expense]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tripId) {
      newErrors.tripId = 'Debe seleccionar un viaje';
    }

    if (!formData.category) {
      newErrors.category = 'Debe seleccionar una categoría';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Debe ingresar un monto válido mayor a 0';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Por favor, corrija los errores en el formulario', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const expenseData = {
        ...formData,
        amount: Number(formData.amount)
      };

      if (expense) {
        await updateExpense(expense.id, expenseData);
        showNotification('Gasto actualizado correctamente', 'success');
      } else {
        await createExpense(expenseData);
        showNotification('Gasto creado correctamente', 'success');
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving expense:', error);
      showNotification('Error al guardar el gasto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'Transporte', label: 'Transporte' },
    { value: 'Alojamiento', label: 'Alojamiento' },
    { value: 'Alimentación', label: 'Alimentación' },
    { value: 'Combustible', label: 'Combustible' },
    { value: 'Entretenimiento', label: 'Entretenimiento' },
    { value: 'Comunicaciones', label: 'Comunicaciones' },
    { value: 'Materiales', label: 'Materiales' },
    { value: 'Otros', label: 'Otros' }
  ];

  const statusOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Aprobado', label: 'Aprobado' },
    { value: 'Rechazado', label: 'Rechazado' },
    { value: 'Reembolsado', label: 'Reembolsado' }
  ];

  // Filter trips that are not completed or cancelled
  const availableTrips = trips.filter(trip => 
    trip.status !== 'Completado' && trip.status !== 'Cancelado'
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {expense ? 'Editar Gasto' : 'Nuevo Gasto'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Viaje */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Viaje *
          </label>
          <select
            name="tripId"
            value={formData.tripId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.tripId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Seleccionar viaje...</option>
            {availableTrips.map(trip => (
              <option key={trip.id} value={trip.id}>
                {trip.destination} - {trip.startDate} ({trip.status})
              </option>
            ))}
          </select>
          {errors.tripId && (
            <p className="text-red-500 text-sm mt-1">{errors.tripId}</p>
          )}
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Seleccionar categoría...</option>
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
            placeholder="Describa el gasto..."
            rows={3}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Monto y Fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Monto *"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            error={errors.amount}
            disabled={isSubmitting}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          
          <Input
            label="Fecha *"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
            disabled={isSubmitting}
          />
        </div>

        {/* Comprobante */}
        <Input
          label="Número de Comprobante"
          name="receipt"
          value={formData.receipt}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Número de factura o recibo"
        />

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Guardando...' : (expense ? 'Actualizar' : 'Crear Gasto')}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
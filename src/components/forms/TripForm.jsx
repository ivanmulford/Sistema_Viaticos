import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useViaticos } from '../../hooks/useViaticos';
import Button from '../common/Button';
import Input from '../common/Input';

const TripForm = ({ trip = null, onSuccess, onCancel }) => {
  const { showNotification } = useNotification();
  const { users, createTrip, updateTrip } = useViaticos();
  
  const [formData, setFormData] = useState({
    userId: '',
    destination: '',
    purpose: '',
    startDate: '',
    endDate: '',
    estimatedBudget: '',
    status: 'Planificado'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (trip) {
      setFormData({
        userId: trip.userId || '',
        destination: trip.destination || '',
        purpose: trip.purpose || '',
        startDate: trip.startDate || '',
        endDate: trip.endDate || '',
        estimatedBudget: trip.estimatedBudget || '',
        status: trip.status || 'Planificado'
      });
    }
  }, [trip]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId) {
      newErrors.userId = 'Debe seleccionar un usuario';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'El destino es obligatorio';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'El propósito del viaje es obligatorio';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es obligatoria';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es obligatoria';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (!formData.estimatedBudget || isNaN(formData.estimatedBudget) || Number(formData.estimatedBudget) <= 0) {
      newErrors.estimatedBudget = 'Debe ingresar un presupuesto válido mayor a 0';
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
      const tripData = {
        ...formData,
        estimatedBudget: Number(formData.estimatedBudget)
      };

      if (trip) {
        await updateTrip(trip.id, tripData);
        showNotification('Viaje actualizado correctamente', 'success');
      } else {
        await createTrip(tripData);
        showNotification('Viaje creado correctamente', 'success');
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving trip:', error);
      showNotification('Error al guardar el viaje', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'Planificado', label: 'Planificado' },
    { value: 'En Progreso', label: 'En Progreso' },
    { value: 'Completado', label: 'Completado' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {trip ? 'Editar Viaje' : 'Nuevo Viaje'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Usuario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Usuario *
          </label>
          <select
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.userId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Seleccionar usuario...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.email}
              </option>
            ))}
          </select>
          {errors.userId && (
            <p className="text-red-500 text-sm mt-1">{errors.userId}</p>
          )}
        </div>

        {/* Destino */}
        <Input
          label="Destino *"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          error={errors.destination}
          disabled={isSubmitting}
          placeholder="Ej: Buenos Aires, Argentina"
        />

        {/* Propósito */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Propósito del Viaje *
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.purpose ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
            placeholder="Describa el propósito del viaje..."
            rows={3}
          />
          {errors.purpose && (
            <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>
          )}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha de Inicio *"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            error={errors.startDate}
            disabled={isSubmitting}
          />
          
          <Input
            label="Fecha de Fin *"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            error={errors.endDate}
            disabled={isSubmitting}
          />
        </div>

        {/* Presupuesto Estimado */}
        <Input
          label="Presupuesto Estimado *"
          name="estimatedBudget"
          type="number"
          value={formData.estimatedBudget}
          onChange={handleChange}
          error={errors.estimatedBudget}
          disabled={isSubmitting}
          placeholder="0.00"
          min="0"
          step="0.01"
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
            {isSubmitting ? 'Guardando...' : (trip ? 'Actualizar' : 'Crear Viaje')}
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

export default TripForm;
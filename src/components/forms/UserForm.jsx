import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const UserForm = ({ user = null, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    cargo: '',
    departamento: '',
    activo: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.cargo.trim()) {
      newErrors.cargo = 'El cargo es requerido';
    }

    if (!formData.departamento.trim()) {
      newErrors.departamento = 'El departamento es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre completo"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        error={errors.nombre}
        placeholder="Ingrese el nombre completo"
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="usuario@empresa.com"
        required
      />

      <Input
        label="Cargo"
        name="cargo"
        value={formData.cargo}
        onChange={handleChange}
        error={errors.cargo}
        placeholder="Ej: Gerente, Analista, etc."
        required
      />

      <Input
        label="Departamento"
        name="departamento"
        value={formData.departamento}
        onChange={handleChange}
        error={errors.departamento}
        placeholder="Ej: Ventas, IT, Finanzas, etc."
        required
      />

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="activo"
            checked={formData.activo}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Usuario activo</span>
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {user ? 'Actualizar' : 'Crear'} Usuario
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
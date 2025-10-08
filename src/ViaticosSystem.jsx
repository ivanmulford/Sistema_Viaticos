import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, AlertTriangle, FileText, Download, Calendar, DollarSign, MapPin, User, Edit2, Trash2, Search, BarChart3, PieChart, Save, X, RefreshCw } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ========================================
// CONFIGURACIÓN - CAMBIA ESTOS VALORES
// ========================================
const GOOGLE_API_KEY = 'AIzaSyDgCLvkaDKzR2JII0SwgAfw2ZN7-qORPQU'; // Paso 2: Pega tu API Key aquí
const SPREADSHEET_ID = '14hfwRIbXiqDuB7litwEYw9zgMurX9aXW5J1zkUx7ZKA'; // Paso 3: Pega el ID de tu hoja aquí
const SHEET_NAME = 'Hoja 1'; // Nombre de la pestaña en tu Google Sheet
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxX36kAbULXgE5XBgTYhsGPgbtZluHUGQ4Im1-YgGxi3vzJ1t3mZ5PusW0N0_6d0t3F/exec';

const ViaticosSystem = () => {
  const [viajes, setViajes] = useState([]);
  const [formulario, setFormulario] = useState({
    fecha: '',
    proposito: '',
    responsable: '',
    municipio: '',
    valor: '',
    descripcion: ''
  });
  const [montoAprobado, setMontoAprobado] = useState({});
  const [filtroPersona, setFiltroPersona] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mostrarGraficos, setMostrarGraficos] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Cargar datos desde Google Sheets usando API v4
  const cargarDatosDesdeSheets = async () => {
    setCargandoDatos(true);
    try {
      const range = `${SHEET_NAME}!A2:F`; // Leer desde fila 2 (asumiendo que fila 1 es header)
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.values && data.values.length > 0) {
        const viajesDesdeSheets = data.values.map((row, index) => ({
          id: index + 2, // +2 porque empezamos en fila 2
          fecha: row[0] || '',
          proposito: row[1] || '',
          responsable: row[2] || '',
          municipio: row[3] || '',
          valor: parseFloat(row[4]) || 0,
          descripcion: row[5] || ''
        }));
        
        setViajes(viajesDesdeSheets.reverse()); // Más recientes primero
        console.log('✅ Datos cargados desde Google Sheets:', viajesDesdeSheets.length, 'viajes');
      } else {
        console.log('ℹ️ No hay datos en la hoja');
        setViajes([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      alert('⚠️ Error al cargar datos. Verifica tu API Key y Spreadsheet ID en el código.');
      
      // Datos de ejemplo como fallback
      const datosIniciales = [
        { fecha: '2025-05-08', proposito: 'PROCESO DE APERTURA', responsable: 'KAREN PAOLA VARGAS', municipio: 'CIENAGA', valor: 10000, descripcion: 'TRANSPORTE SANTA MARTA - CIENAGA', id: 1 },
        { fecha: '2025-05-08', proposito: 'PROCESO DE APERTURA', responsable: 'KAREN PAOLA VARGAS', municipio: 'CIENAGA', valor: 10000, descripcion: 'TRANSPORTE CENTRO ZONAL', id: 2 },
      ];
      setViajes(datosIniciales);
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => {
    cargarDatosDesdeSheets();
    setMontoAprobado({ 'KAREN PAOLA VARGAS': 800000 });
  }, []);

  const agregarViaje = async () => { 
    if (cargando) return; 
    if (!formulario.fecha || !formulario.responsable || !formulario.valor) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    
    setCargando(true); 

    const viajeParaEnviar = {
      ...formulario,
      valor: parseFloat(formulario.valor),
      id: Date.now() 
    };

    try {
      // Enviar a Google Apps Script (para escribir)
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(viajeParaEnviar), 
      });

      alert('✅ ¡Registro enviado a Google Sheets!');
      
      // Actualizar estado local
      setViajes([viajeParaEnviar, ...viajes]); 
      
      // Limpiar formulario
      setFormulario({
        fecha: '',
        proposito: '',
        responsable: '',
        municipio: '',
        valor: '',
        descripcion: ''
      });

      // Recargar datos después de 2 segundos
      setTimeout(() => {
        cargarDatosDesdeSheets();
      }, 2000);

    } catch (error) {
      alert('⚠️ Error de conexión.');
      console.error('Error:', error);
    } finally {
      setCargando(false); 
    }
  };

  const iniciarEdicion = (viaje) => {
    setEditando(viaje.id);
    setFormulario({
      fecha: viaje.fecha,
      proposito: viaje.proposito,
      responsable: viaje.responsable,
      municipio: viaje.municipio,
      valor: viaje.valor.toString(),
      descripcion: viaje.descripcion
    });
  };

  const guardarEdicion = () => {
    const viajesActualizados = viajes.map(v => 
      v.id === editando 
        ? { ...formulario, valor: parseFloat(formulario.valor), id: editando }
        : v
    );
    setViajes(viajesActualizados);
    setEditando(null);
    setFormulario({
      fecha: '',
      proposito: '',
      responsable: '',
      municipio: '',
      valor: '',
      descripcion: ''
    });
    alert('✅ Viaje actualizado (solo localmente)');
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setFormulario({
      fecha: '',
      proposito: '',
      responsable: '',
      municipio: '',
      valor: '',
      descripcion: ''
    });
  };

  const eliminarViaje = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este viaje? (Solo se eliminará localmente)')) {
      setViajes(viajes.filter(v => v.id !== id));
      alert('🗑️ Viaje eliminado localmente');
    }
  };

  const calcularEstadisticas = () => {
    const personas = {};
    viajes.forEach(viaje => {
      if (!personas[viaje.responsable]) {
        personas[viaje.responsable] = {
          total: 0,
          viajes: 0,
          transportes: 0,
          alimentacion: 0,
          otros: 0
        };
      }
      
      personas[viaje.responsable].total += viaje.valor;
      personas[viaje.responsable].viajes += 1;
      
      if (viaje.descripcion.toLowerCase().includes('transporte')) {
        personas[viaje.responsable].transportes += viaje.valor;
      } else if (viaje.descripcion.toLowerCase().includes('alimentacion')) {
        personas[viaje.responsable].alimentacion += viaje.valor;
      } else {
        personas[viaje.responsable].otros += viaje.valor;
      }
    });
    return personas;
  };

  const estadisticas = calcularEstadisticas();
  
  const personasFiltradas = filtroPersona 
    ? Object.keys(estadisticas).filter(p => p === filtroPersona)
    : Object.keys(estadisticas);

  const viajesFiltrados = viajes.filter(v => {
    const cumpleFiltroPersona = !filtroPersona || v.responsable === filtroPersona;
    const cumpleFiltroMes = !filtroMes || v.fecha.startsWith(filtroMes);
    const cumpleBusqueda = !busqueda || 
      v.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.municipio.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.proposito.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltroPersona && cumpleFiltroMes && cumpleBusqueda;
  });

  const datosGraficoBarras = personasFiltradas.map(persona => ({
    nombre: persona.split(' ')[0] + ' ' + persona.split(' ')[1],
    Transportes: estadisticas[persona].transportes,
    Alimentación: estadisticas[persona].alimentacion,
    Otros: estadisticas[persona].otros
  }));

  const datosMunicipios = {};
  viajesFiltrados.forEach(v => {
    if (v.municipio) {
      datosMunicipios[v.municipio] = (datosMunicipios[v.municipio] || 0) + v.valor;
    }
  });

  const datosGraficoTorta = Object.entries(datosMunicipios).map(([nombre, valor]) => ({
    name: nombre,
    value: valor
  }));

  const COLORES = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const exportarExcel = () => {
    const datos = viajesFiltrados.map(v => 
      `${v.fecha}\t${v.proposito}\t${v.responsable}\t${v.municipio}\t${v.valor}\t${v.descripcion}`
    ).join('\n');
    const header = 'FECHA\tPROPOSITO\tRESPONSABLE\tMUNICIPIO\tVALOR\tDESCRIPCION\n';
    const csv = header + datos;
    
    const blob = new Blob([csv], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viaticos_${filtroPersona || 'todos'}_${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
  };

  const actualizarMontoAprobado = (persona, monto) => {
    setMontoAprobado({
      ...montoAprobado,
      [persona]: parseFloat(monto) || 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {cargandoDatos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
            <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-semibold text-gray-700">Cargando datos desde Google Sheets...</p>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-blue-600" />
                Sistema de Legalización de Viáticos
              </h1>
              <p className="text-gray-600 mt-2">PROYECTOS SOCIALES - Control Viajes a Municipios</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-sm text-gray-500">CÓDIGO: PS-P01-F41</p>
                <p className="text-sm text-gray-500">VERSIÓN 01</p>
              </div>
              <button
                onClick={cargarDatosDesdeSheets}
                disabled={cargandoDatos}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm disabled:bg-gray-400"
              >
                <RefreshCw className={`w-4 h-4 ${cargandoDatos ? 'animate-spin' : ''}`} />
                {cargandoDatos ? 'Sincronizando...' : 'Sincronizar con Sheets'}
              </button>
            </div>
          </div>
        </div>

        {/* Alerta de configuración */}
        {(GOOGLE_API_KEY === 'TU_API_KEY_AQUI' || SPREADSHEET_ID === 'TU_SPREADSHEET_ID_AQUI') && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Configuración pendiente</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Para habilitar la sincronización con Google Sheets, configura:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>GOOGLE_API_KEY (línea 6 del código)</li>
                    <li>SPREADSHEET_ID (línea 7 del código)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Búsqueda Avanzada */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Search className="text-purple-600" />
            Búsqueda Avanzada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por texto</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar en descripción, municipio o propósito..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Persona</label>
              <select
                value={filtroPersona}
                onChange={(e) => setFiltroPersona(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las personas</option>
                {Object.keys(estadisticas).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Mes</label>
              <input
                type="month"
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Mostrando {viajesFiltrados.length} de {viajes.length} viajes
          </div>
        </div>

        {/* Formulario de Registro/Edición */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            {editando ? (
              <>
                <Edit2 className="text-orange-600" />
                Editando Viaje
              </>
            ) : (
              <>
                <PlusCircle className="text-green-600" />
                Registrar Nuevo Viaje
              </>
            )}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline w-4 h-4 mr-1" />
                Fecha *
              </label>
              <input
                type="date"
                value={formulario.fecha}
                onChange={(e) => setFormulario({...formulario, fecha: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="inline w-4 h-4 mr-1" />
                Responsable *
              </label>
              <input
                type="text"
                value={formulario.responsable}
                onChange={(e) => setFormulario({...formulario, responsable: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre completo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline w-4 h-4 mr-1" />
                Municipio
              </label>
              <input
                type="text"
                value={formulario.municipio}
                onChange={(e) => setFormulario({...formulario, municipio: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: CIENAGA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Propósito del Viaje
              </label>
              <input
                type="text"
                value={formulario.proposito}
                onChange={(e) => setFormulario({...formulario, proposito: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: PROCESO DE APERTURA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Valor *
              </label>
              <input
                type="number"
                value={formulario.valor}
                onChange={(e) => setFormulario({...formulario, valor: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="10000"
              />
            </div>
            
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={formulario.descripcion}
                onChange={(e) => setFormulario({...formulario, descripcion: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="TRANSPORTE SANTA MARTA - CIENAGA"
              />
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            {editando ? (
              <>
                <button
                  onClick={guardarEdicion}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </button>
                <button
                  onClick={cancelarEdicion}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={agregarViaje}
                disabled={cargando}
                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {cargando ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    Agregar Viaje
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Gráficos */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="text-indigo-600" />
              Análisis Visual
            </h2>
            <button
              onClick={() => setMostrarGraficos(!mostrarGraficos)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              {mostrarGraficos ? <X className="w-4 h-4" /> : <PieChart className="w-4 h-4" />}
              {mostrarGraficos ? 'Ocultar' : 'Mostrar'} Gráficos
            </button>
          </div>

          {mostrarGraficos && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Gastos por Categoría</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosGraficoBarras}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="Transportes" fill="#3B82F6" />
                    <Bar dataKey="Alimentación" fill="#10B981" />
                    <Bar dataKey="Otros" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Distribución por Municipio</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={datosGraficoTorta}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {datosGraficoTorta.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas por Persona */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-purple-600" />
              Estadísticas por Persona
            </h2>
            <button
              onClick={exportarExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>

          <div className="space-y-4">
            {personasFiltradas.map(persona => {
              const stats = estadisticas[persona];
              const aprobado = montoAprobado[persona] || 0;
              const porcentaje = aprobado > 0 ? (stats.total / aprobado * 100).toFixed(1) : 0;
              const excedido = stats.total > aprobado;

              return (
                <div key={persona} className={`border-2 rounded-lg p-4 ${excedido ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">{persona}</h3>
                    {excedido && (
                      <div className="flex items-center gap-2 text-red-600 font-bold">
                        <AlertTriangle className="w-5 h-5" />
                        PRESUPUESTO EXCEDIDO
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Total Gastado</p>
                      <p className="text-xl font-bold text-blue-700">${stats.total.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Transportes</p>
                      <p className="text-xl font-bold text-green-700">${stats.transportes.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-100 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Alimentación</p>
                      <p className="text-xl font-bold text-orange-700">${stats.alimentacion.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Cantidad Viajes</p>
                      <p className="text-xl font-bold text-purple-700">{stats.viajes}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monto Aprobado</label>
                      <input
                        type="number"
                        value={aprobado}
                        onChange={(e) => actualizarMontoAprobado(persona, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Disponible</p>
                      <p className={`text-2xl font-bold ${excedido ? 'text-red-600' : 'text-green-600'}`}>
                        ${(aprobado - stats.total).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Uso del Presupuesto</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${excedido ? 'bg-red-600' : 'bg-green-600'}`}
                            style={{width: `${Math.min(porcentaje, 100)}%`}}
                          ></div>
                        </div>
                        <span className={`font-bold ${excedido ? 'text-red-600' : 'text-gray-700'}`}>
                          {porcentaje}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabla de Viajes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Detalle de Viajes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fecha</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Propósito</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Responsable</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Municipio</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Valor</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Descripción</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {viajesFiltrados.map((viaje, idx) => (
                  <tr key={viaje.id || idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{viaje.fecha}</td>
                    <td className="px-4 py-2 text-sm">{viaje.proposito}</td>
                    <td className="px-4 py-2 text-sm">{viaje.responsable}</td>
                    <td className="px-4 py-2 text-sm">{viaje.municipio}</td>
                    <td className="px-4 py-2 text-sm text-right font-semibold">${viaje.valor.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">{viaje.descripcion}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => iniciarEdicion(viaje)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarViaje(viaje.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan="4" className="px-4 py-2 text-right font-bold">TOTAL:</td>
                  <td className="px-4 py-2 text-right font-bold text-lg">
                    ${viajesFiltrados.reduce((sum, v) => sum + v.valor, 0).toLocaleString()}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViaticosSystem;

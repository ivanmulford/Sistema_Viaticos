import React from 'react';
import ReactDOM from 'react-dom/client';
import ViaticosSystem from './ViaticosSystem.jsx'; // Asegúrate de que el nombre del componente sea correcto
import './index.css'; // Importa el archivo de estilos de Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ViaticosSystem />
  </React.StrictMode>,
);

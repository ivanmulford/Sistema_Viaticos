class GoogleSheetsService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
    this.sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID || '14hfwRIbXiqDuB7litwEYw9zgMurX9aXW5J1zkUx7ZKA';
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  }

  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en solicitud a Google Sheets:', error);
      throw error;
    }
  }

  async readRange(range) {
    if (!this.apiKey) {
      throw new Error('API Key no configurada. Verifica tu archivo .env');
    }

    const url = `${this.baseUrl}/${this.sheetId}/values/${range}?key=${this.apiKey}`;
    const data = await this.makeRequest(url);
    
    return data.values || [];
  }

  async readMultipleRanges(ranges) {
    if (!this.apiKey) {
      throw new Error('API Key no configurada. Verifica tu archivo .env');
    }

    const rangeParams = ranges.map(range => `ranges=${encodeURIComponent(range)}`).join('&');
    const url = `${this.baseUrl}/${this.sheetId}/values:batchGet?${rangeParams}&key=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    return data.valueRanges || [];
  }

  // Métodos específicos para cada entidad
  async getUsers() {
    try {
      const data = await this.readRange('Usuarios!A2:F');
      return data.map((row, index) => ({
        id: index + ,
        nombre: row[0] || '',
        email: row[1] || '',
        cargo: row[2] || '',
        departamento: row[3] || '',
        activo: row[4] !== 'false',
        fechaCreacion: row[5] || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

  async getTrips() {
    try {
      const data = await this.readRange('Viajes!A2:J');
      return data.map((row, index) => ({
        id: index + 1,
        destino: row[0] || '',
        fechaInicio: row[1] || '',
        fechaFin: row[2] || '',
        motivo: row[3] || '',
        usuarioId: parseInt(row[4]) || null,
        presupuesto: parseFloat(row[5]) || 0,
        estado: row[6] || 'pendiente',
        viaticoDiario: parseFloat(row[7]) || 0,
        anticipoSolicitado: parseFloat(row[8]) || 0,
        fechaCreacion: row[9] || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error al obtener viajes:', error);
      return [];
    }
  }

  async getExpenses() {
    try {
      const data = await this.readRange('Gastos!A2:H');
      return data.map((row, index) => ({
        id: index + 1,
        viajeId: parseInt(row[0]) || null,
        fecha: row[1] || '',
        concepto: row[2] || '',
        monto: parseFloat(row[3]) || 0,
        categoria: row[4] || '',
        comprobante: row[5] || '',
        aprobado: row[6] !== 'false',
        fechaCreacion: row[7] || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error al obtener gastos:', error);
      return [];
    }
  }

  async getAllData() {
    try {
      const ranges = ['Usuarios!A2:F', 'Viajes!A2:J', 'Gastos!A2:H'];
      const [usersData, tripsData, expensesData] = await this.readMultipleRanges(ranges);
      
      return {
        users: this.processUsers(usersData.values || []),
        trips: this.processTrips(tripsData.values || []),
        expenses: this.processExpenses(expensesData.values || [])
      };
    } catch (error) {
      console.error('Error al obtener todos los datos:', error);
      return { users: [], trips: [], expenses: [] };
    }
  }

  processUsers(data) {
    return data.map((row, index) => ({
      id: index + 1,
      nombre: row[0] || '',
      email: row[1] || '',
      cargo: row[2] || '',
      departamento: row[3] || '',
      activo: row[4] !== 'false',
      fechaCreacion: row[5] || new Date().toISOString()
    }));
  }

  processTrips(data) {
    return data.map((row, index) => ({
      id: index + 1,
      destino: row[0] || '',
      fechaInicio: row[1] || '',
      fechaFin: row[2] || '',
      motivo: row[3] || '',
      usuarioId: parseInt(row[4]) || null,
      presupuesto: parseFloat(row[5]) || 0,
      estado: row[6] || 'pendiente',
      viaticoDiario: parseFloat(row[7]) || 0,
      anticipoSolicitado: parseFloat(row[8]) || 0,
      fechaCreacion: row[9] || new Date().toISOString()
    }));
  }

  processExpenses(data) {
    return data.map((row, index) => ({
      id: index + 1,
      viajeId: parseInt(row[0]) || null,
      fecha: row[1] || '',
      concepto: row[2] || '',
      monto: parseFloat(row[3]) || 0,
      categoria: row[4] || '',
      comprobante: row[5] || '',
      aprobado: row[6] !== 'false',
      fechaCreacion: row[7] || new Date().toISOString()
    }));
  }
}

export default new GoogleSheetsService();

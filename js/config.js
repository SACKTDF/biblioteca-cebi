/* =========================================================
   Configuración de la Biblioteca CEBI
   Edita estos valores y vuelve a subir el archivo a GitHub.
   ========================================================= */
window.CEBI_CONFIG = {
  colegio: 'Unidad Educativa CEBI',
  ciudad: 'Ambato, Ecuador',

  // Días de préstamo por defecto
  diasEstudiante: 7,
  diasDocente: 15,

  // --- Base de datos compartida (opcional) ---
  // Sin esto, cada computador guarda sus préstamos solo en su navegador.
  // Para que TODOS los computadores de la biblioteca compartan los mismos datos,
  // sigue la guía de README.md («Conectar con Google Sheets») y pega aquí:
  SHEETS_URL: '',   // ej.: 'https://script.google.com/macros/s/AKfy.../exec'
  SHEETS_KEY: '',   // la misma clave que pusiste en Code.gs

  // Portadas y datos de libros desde la web (Open Library / Google Books)
  portadasWeb: true
};

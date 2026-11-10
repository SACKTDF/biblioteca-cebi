# Biblioteca CEBI · Ambato, Ecuador

Buscador de libros en 3D para la Unidad Educativa CEBI (Colegio del Mundo del IB). Funciona como un mini videojuego: Draco, el dragón guardián, sigue el cursor, cuenta datos curiosos y se enoja si lo molestas demasiado. Los estantes, los libros, el escudo y los banderines se pueden tocar.

## Qué hace

- **Catálogo** de 4.686 títulos (7.586 ejemplares). Se puede buscar por título, autor, editorial, ISBN, área, tema, código o ubicación, y filtrar por colección, área, estante, idioma, estado y "lectura fácil (NEE)".
- **Mundo 3D**: once estantes con los libros reales de cada hilera. Pasa el cursor sobre un lomo para ver el título y haz clic para abrir la ficha. Clic en un estante para explorarlo, en el escudo para conocer el colegio y en los banderines para ver los programas del IB (PEP, PAI, PD, Perfil de la comunidad de aprendizaje, Continuo del IB). Los faroles se encienden y apagan con un clic.
- **Descubridor**: busca en el catálogo físico (disponible / no disponible, con estante y hilera) y en repositorios abiertos en vivo: Open Library, OpenAlex y Project Gutenberg. También incluye enlaces a otros repositorios gratuitos.
- **Préstamos y devoluciones** con fecha de entrega (7 días para estudiantes y 15 para docentes, se cambia en `js/config.js`), historial y vencidos.
- **Inventario**: estado físico, "¿funciona?", ingresos de libros nuevos y bitácora de movimientos.
- **Reportes imprimibles** en cualquier momento: préstamos activos (quién tiene cada libro), vencidos (pendientes), historial por fechas, movimientos y libros fuera de servicio. Todos con espacio para firmas. También exportan a CSV.
- **Portadas**: se descargan automáticamente de Open Library por ISBN. Si no hay portada se genera una con los colores del libro, y el bibliotecario puede pegar la URL de cualquier imagen ("Cambiar portada").
- **Juego**: escamas del saber (XP), niveles, misiones e insignias para motivar la lectura.

## Accesibilidad (NEE)

Botón ♿ arriba a la derecha:

- tamaño de texto;
- letra Lexend (más legible, ayuda con dislexia);
- más espaciado;
- alto contraste;
- regla de lectura que sigue al cursor;
- modo calma (sin movimiento ni brillos);
- modo simple (oculta el 3D);
- lectura en voz alta de las fichas;
- calidad de efectos.

El filtro "Lectura fácil" muestra libros cortos o ilustrados. Toda la app se usa con teclado: `/` busca, `1`–`7` cambia de sección y `Esc` cierra.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo y sube **todo el contenido de esta carpeta** (incluye `models/dragon.glb`).
2. En el repositorio entra a **Settings → Pages → Source: Deploy from a branch → main / (root)** y guarda.
3. En uno o dos minutos la app queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

> Abrir `index.html` con doble clic (`file://`) no carga el dragón, porque los navegadores bloquean el modelo 3D. Para probarla en tu computadora usa un servidor local, por ejemplo `python -m http.server` dentro de la carpeta, y abre `http://localhost:8000`.

## Dónde se guardan los datos

**Por defecto** (sin configurar nada) los préstamos y cambios se guardan **en el navegador del computador de la biblioteca** (localStorage). Esto funciona bien con un solo computador. Haz copias desde **Herramientas → Respaldo JSON**.

**Para compartir datos entre varios computadores** se usa Google Sheets, que es gratis:

1. Crea una hoja de cálculo en Google Drive y entra a **Extensiones → Apps Script**.
2. Pega el contenido de `apps-script/Code.gs` y cambia la constante `CLAVE` por una contraseña propia.
3. Haz clic en **Implementar → Nueva implementación → Aplicación web**, con "Ejecutar como: yo" y "Quién tiene acceso: cualquier persona". Copia la URL que termina en `/exec`.
4. En `js/config.js` completa `SHEETS_URL` con esa URL y `SHEETS_KEY` con la misma clave. Sube el cambio a GitHub.

La app se sincroniza cada 30 segundos y el indicador de arriba muestra "Google Sheets".

> Como el repositorio es público, cualquiera puede ver la clave en `config.js`. Úsala solo para la biblioteca y no la reutilices en otras cuentas.

## Modo bibliotecario

El botón de la esquina superior derecha cambia entre **Estudiante** y **Bibliotecario**. Préstamos, inventario, reportes y herramientas solo aparecen en modo bibliotecario.

## Completar datos desde la web

**Herramientas → Completar con datos de la web** consulta Open Library por ISBN y agrega año, páginas, temas y portada a cada libro. Luego **Exportar datos web (CSV)** descarga esos datos para pegarlos en el Excel `Catalogo_Biblioteca_CEBI_2026.xlsx`.

## Actualizar el catálogo

El catálogo está en `data/books.js`. Para libros nuevos usa **Inventario → Ingreso**, que no requiere editar código. Si cambias mucho el Excel, se puede regenerar `books.js` a partir de él.

## Estructura

```
index.html          interfaz
css/styles.css      estilos (juego, NEE, impresión)
js/config.js        ajustes del colegio (días de préstamo, Google Sheets)
js/app.js           catálogo, préstamos, inventario, reportes, descubridor
js/features.js      portadas, juego, Draco, accesibilidad, impresión, omnibox
js/world.js         mundo 3D (three.js r128)
js/store-sheets.js  conexión opcional a Google Sheets
apps-script/Code.gs servidor gratuito en Google Sheets
data/books.js       catálogo
img/                escudo CEBI, logos IB
models/dragon.glb   Draco (recoloreado con los colores CEBI)
```

## Créditos y licencias

- Logos del IB: © International Baccalaureate Organization, usados con fines institucionales internos del colegio autorizado.
- Modelo del dragón: revisa la licencia del archivo original antes de publicar el repositorio. Si exige atribución, agrégala aquí.
- three.js (MIT). Datos web: Open Library, OpenAlex y Gutendex (APIs abiertas).

# EduFísica Pro 🏋️‍♂️📱

Plataforma moderna y minimalista de planificación y seguimiento deportivo para **Profesores de Educación Física y Alumnos/as**.

---

## 🌟 Características Principales

### 1. Perfil Profesor/a (Coach)
- **Panel lateral izquierdo minimalista y redondeado**:
  - 👥 **Alumnos/as**: Fichas de estudiantes, objetivos, restricciones médicas, teléfono y botón de planificación directa.
  - 📅 **Calendario Interactivo**: Vista semanal y mensual (ej. semana del 28/09/2026). Permite ver y asignar sesiones por fecha y alumno.
  - 📝 **Planificador de Rutinas**: Diseña entrenamientos con series, repeticiones sugeridas, cargas en $kg$ y notas técnicas.
  - 📷 **Escáner de Papel (Sharp + OCR)**:
    - Sube o toma una foto de la rutina manuscrita en papel.
    - Se procesa en el backend con **Sharp**, reduciendo hasta un 90% el peso de la imagen y convirtiéndola a WebP liviano.
    - Se extrae el texto mediante **Tesseract.js** para digitalizar automáticamente los ejercicios sin que el profe tenga que cambiar su hábito de escribir a mano.
    - La foto original queda adjunta como referencia directa para el alumno.
  - 🎬 **Biblioteca Multimedia**:
    - Subida de fotos optimizadas con Sharp.
    - Enlaces de videos de YouTube (shorts, videos normales) con reproductor embebido instantáneo para enseñar la técnica correcta de cada movimiento.

### 2. Perfil Alumno/a
- ⚡ **"Mi Rutina de Hoy"**: Vista limpia con la sesión del día (ej. Lunes 28/09/2026).
- 📷 **Visualizador de Hoja de Papel Original**: Botón directo para consultar la foto de la planilla física del profe.
- 🏋️‍♂️ **Registro de Cargas Vuelta por Vuelta**:
  - En cada ejercicio el alumno tiene campos dinámicos para anotar: **Vuelta #1, #2, #3... Kg usados y Repeticiones reales logradas**, con checkbox de serie completada.
  - Botón para agregar vueltas adicionales.
- 🎬 **Visor de Técnica (Foto / Video)**:
  - Al hacer clic en cualquier ejercicio se abre un modal con el reproductor embebido de YouTube o la foto ilustrativa del profe.
- 📅 **Plan Semanal e Historial**:
  - Pestaña para revisar la planificación de lunes a domingo y el registro histórico de sobrecarga progresiva.

### 3. Autenticación y Sesión
- Login limpio con **Nombre y Apellido, Mail, Contraseña**.
- Selector dinámico de Rol: **Profesor/a** o **Alumno/a**.
- Opción de **Autoguardado de credenciales** (`rememberMe`).
- Botones de acceso rápido para pruebas inmediatas ("Demo Profe", "Demo Alumna").

---

## 🛠️ Stack Tecnológico ($0 Costo de Licencias)

### Backend (`/server`)
- **Node.js + Express + TypeScript**
- **Sharp**: Compresión de imágenes de alta resolución a formato WebP ligero, redimensionamiento adaptativo y ahorro de ancho de banda >80%.
- **Multer**: Procesamiento en memoria de fotos para evitar escrituras temporales innecesarias.

### Frontend (`/client`)
- **React + TypeScript + Vite**
- **Tailwind CSS**: Diseño contemporáneo, paleta clara deportiva (blancos, neutros slate y acentos esmeralda/índigo), bordes redondeados (`rounded-2xl`, `rounded-3xl`, píldoras) y microinteracciones dinámicas.
- **Lucide React**: Iconografía deportiva y médica consistente.
- **Tesseract.js**: Motor OCR en WebAssembly que procesa la letra del papel directamente en el cliente.
- **Date-fns**: Manejo de fechas y semanas deportivas.

### Arquitectura de Datos Desacoplada (Preparada para Supabase)
Actualmente utiliza una capa de servicios (`StorageService`) con almacenamiento local reactivo. Cuando decidas implementar la base de datos de producción con Supabase:
1. Simplemente se configuran las variables de entorno de `@supabase/supabase-js`.
2. Las llamadas de `StorageService` se conectan a las tablas de PostgreSQL de Supabase y a Supabase Storage para las imágenes procesadas por Sharp.
3. **No se reescribe ningún componente de la interfaz de usuario.**

---

## 🚀 Cómo Iniciar la Aplicación

1. Desde la carpeta raíz (`c:\antigravity\PF`):
   ```bash
   npm run dev
   ```
   *Esto iniciará concurrentemente:*
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend con Sharp**: [http://localhost:4000](http://localhost:4000)

2. Abre tu navegador en **http://localhost:3000** y utiliza el acceso de prueba con un solo clic:
   - Haz clic en **"Demo Profe"** para ingresar al panel de entrenador.
   - O haz clic en **"Demo Alumna"** para probar el seguimiento de cargas vuelta por vuelta.

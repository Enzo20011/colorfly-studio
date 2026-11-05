# Colorfly Studio - Generador de Paletas Interactivo

Generador de paletas de colores. Crea esquemas con un botón, deja bloquear los colores que gustan y copia los valores en HEX y HSL.

Demo: https://colorfly-studio.vercel.app

![Paleta de seis colores](docs/img/col-1.webp)
![Otra paleta de seis colores](docs/img/col-2.webp)
![Paleta de ocho colores](docs/img/col-3.webp)

Más trabajos en mi portfolio: https://portfolio-fawn-kappa-35.vercel.app

## Características y Funcionalidades

- **Generación Aleatoria:** Crea esquemas de colores presionando un solo botón.
- **Renderizado Dinámico:** Elige visualizar entre 6, 8 o 9 colores simultáneamente.
- **Bloqueo de Colores:** Mantén los colores que te gusten haciendo clic en el ícono del candado y genera nuevos colores para el resto.
- **Formatos Múltiples:** Visualiza el valor de cada color en formato **HEX** y **HSL**.
- **Copiar al Portapapeles:** Haz clic sobre el código HEX de cualquier color para copiarlo al instante. Aparecerá un microfeedback visual (Toast).
- **Persistencia de Datos:** La última paleta generada se guarda automáticamente en `localStorage`, de manera que no pierdas tu trabajo si recargas la página.
- **Diseño:** Interfaz con "Glassmorphism", animaciones de entrada, Dark Mode por defecto y responsive design con CSS Grid.

## Tecnologías Utilizadas

- **HTML5:** Marcado semántico y estructura accesible (roles, aria-labels).
- **CSS3:** Flexbox, CSS Grid, Variables Nativas, Transformaciones y Transiciones.
- **JavaScript (Vanilla):** Manipulación del DOM, control de estado (Arrays/Objetos), `localStorage` y API de Portapapeles.
- **Phosphor Icons:** Biblioteca de iconos ligeros.

## Instrucciones de Instalación y Uso Local

Para correr este proyecto en tu entorno local, sigue estos pasos:

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/Enzo20011/colorfly-studio.git
   ```

2. **Acceder a la carpeta:**

   ```bash
   cd colorfly-studio
   ```

3. **Ejecutar la aplicación:**
   Como es una aplicación web estática, no necesitas instalar dependencias (node_modules ni paquetes). Simplemente abre el archivo `index.html` en tu navegador web de preferencia (doble clic) o utiliza una extensión como **Live Server** en VSCode.

## Decisiones Técnicas

1. **Arquitectura HTML:** Se usaron etiquetas como `<header>` y `<main>` para segmentar lógicamente la app. Las notificaciones utilizan `aria-live="polite"` y `role="alert"` para cumplir con los estándares básicos de accesibilidad de lectores de pantalla.
2. **Estrategia CSS:** Se decidió no utilizar frameworks como Tailwind o Bootstrap. En su lugar, se crearon variables globales de CSS (`:root`) para mantener la coherencia del esquema de colores "Slate". Se utilizó **CSS Grid** en el `.palette-container` con `grid-template-columns` dinámico desde JavaScript, para repartir el ancho equitativamente (ej: `repeat(6, 1fr)`).
3. **Manejo de Estado (JS):** Todo se controla desde la variable `currentPalette`, que es un arreglo de objetos. Al centralizar la "fuente de verdad" en este array, las funciones como "Bloquear", "Generar" o "Cambiar tamaño" simplemente mutan el estado y luego llaman a `saveAndRender()`, manteniendo la UI sincronizada de forma eficiente.

## Despliegue

Está publicada en Vercel: https://colorfly-studio.vercel.app. Como es una página estática, sirve cualquier hosting estático.

# Conecta & Participa — plataforma BBV

Aplicación web para registrar estudiantes mediante QR, ejecutar un cuestionario en vivo y entregar premios con una ruleta controlada por inventario.

## Funciones incluidas

- Registro con nombre, correo, género y rango de edad (18–23 o 24–28).
- Ingreso automático al cuestionario después de completar un registro válido.
- QR de registro generado con la URL pública configurada.
- Tres accesos de organizador: `admin`, `cjustiniano` y `dpinto`.
- Cuestionario en vivo con sala, proyección, respuestas móviles, rapidez, resultados y clasificación.
- Editor de preguntas desde el panel.
- Ruleta completamente separada, con acceso propio, imágenes, ganador registrado e inventario automático.
- Selección ponderada por existencias: al inicio, un bolígrafo tiene 150/280 de probabilidad; las probabilidades se ajustan automáticamente al inventario restante.
- Exportación de participantes a CSV.
- Persistencia en `data/store.json` (la carpeta se monta como disco persistente en Render).

## Ejecutar localmente

Necesitas Node.js 20 o superior.

```powershell
npm install
npm start
```

Abre `http://localhost:3000`.

Para una prueba local inmediata, las credenciales iniciales son:

| Usuario | Contraseña local predeterminada |
| --- | --- |
| `admin` | `AdminFeria2026!` |
| `cjustiniano` | `Cjustiniano2026!` |
| `dpinto` | `Dpinto2026!` |
| `avega` | `BBVAvega2026!` |

Estas contraseñas son solo para revisión local. En Render se deben configurar obligatoriamente como variables privadas.

## Publicar en GitHub y Render

1. Sube todo el proyecto a un repositorio privado o público de GitHub.
2. En Render elige **New → Blueprint** y conecta el repositorio. Render detectará `render.yaml`.
3. Completa las variables solicitadas:
   - `ADMIN_PASSWORD`
   - `CJUSTINIANO_PASSWORD`
   - `DPINTO_PASSWORD`
   - `AVEGA_PASSWORD`
4. Render crea automáticamente `SESSION_SECRET` y un disco persistente de 1 GB.
5. Una vez desplegado, vuelve al panel, revisa el QR y descárgalo para proyectarlo o imprimirlo.

El Blueprint está configurado para utilizar el plan gratuito de Render.

## Operación durante la feria

1. El organizador entra por `/login.html` y accede al panel administrativo.
2. Desde el panel abre **Proyectar QR** en una pantalla separada, sin controles administrativos visibles.
3. Los estudiantes escanean, completan datos válidos y entran automáticamente a su pantalla privada.
4. En **Preguntas**, ajusta y guarda el cuestionario.
5. En **Cuestionario**, pulsa **Iniciar desde la primera**, luego **Mostrar respuesta** y **Siguiente**.
6. La ruleta no está dentro del panel del cuestionario. Se abre por separado en `/ruleta.html`; selecciona un participante sin premio y pulsa **Girar**.

## Copia de seguridad

El archivo persistente es `data/store.json`. Además, desde **Participantes → Exportar CSV** se puede descargar la base de asistentes durante el evento.

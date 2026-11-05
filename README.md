# Conecta & Participa — plataforma BBV

Aplicación web para registrar estudiantes mediante QR, ejecutar un cuestionario en vivo y entregar premios con una ruleta controlada por inventario.

## Funciones incluidas

- Registro con nombre, correo, género y rango de edad (18–23 o 24–28).
- Ingreso automático al cuestionario después de completar un registro válido.
- QR de registro generado con la URL pública configurada.
- Cuatro accesos de organizador: `admin`, `cjustiniano`, `dpinto` y `avega`.
- Cuestionario en vivo con sala, proyección, respuestas móviles, rapidez, resultados y clasificación.
- Editor de preguntas desde el panel.
- Ruleta completamente separada, con acceso propio, imágenes, ganador registrado e inventario automático.
- Selección ponderada por existencias: al inicio, un bolígrafo tiene 150/280 de probabilidad; las probabilidades se ajustan automáticamente al inventario restante.
- Exportación de participantes a CSV y respaldo completo en JSON, con manejo de sesión vencida.
- Guardado atómico con copia anterior; nunca sustituye archivos dañados por una base vacía.
- Persistencia local en `data/store.json`; en Render Free utiliza archivos temporales; con un disco montado en `/var/data` conserva los datos entre despliegues.
- Fondo animado en perspectiva, controles para pausar el movimiento y MAX, el toro animado original de Aula Bursátil, en la ruleta.

## Ejecutar localmente

Necesitas Node.js 20 o superior.

```powershell
npm install
npm start
```

Abre `http://localhost:3000`.

Los cuatro usuarios habilitados son:

| Usuario | Credencial |
| --- | --- |
| `admin` | Clave entregada al responsable; hash bcrypt en el proyecto. |
| `cjustiniano` | Clave restablecida y entregada al responsable; solo se almacena su hash bcrypt. |
| `dpinto` | Clave entregada al responsable; hash bcrypt en el proyecto. |
| `avega` | Se conserva su clave verificada; hash bcrypt en el proyecto. |

Todos usan los hashes de `staff-credentials.json`. Las claves se entregan al responsable fuera del repositorio. Las antiguas variables de texto plano `*_PASSWORD` ya no se utilizan. Para rotar una cuenta, configura su variable `ADMIN_PASSWORD_HASH`, `CJUSTINIANO_PASSWORD_HASH`, `DPINTO_PASSWORD_HASH` o `AVEGA_PASSWORD_HASH` con un hash bcrypt válido. Todos mantienen los permisos de organizador para panel, preguntas, informes y ruleta.

## Publicar en GitHub y Render

Sigue [DEPLOY_RENDER.md](DEPLOY_RENDER.md) para actualizar el servicio existente.

El registro y la ruleta están habilitados también en Render Free, sin disco de pago. En ese plan los archivos son temporales: descarga CSV y respaldo JSON antes de reiniciar o desplegar. Si existe un disco persistente configurado, el sistema lo utiliza. Las cuatro cuentas usan los hashes incluidos en el proyecto.

El panel identifica si el almacenamiento es temporal o persistente. Solo se bloquean cambios ante un fallo real de escritura, no por usar el plan gratuito.

## Operación durante la feria

1. El organizador entra por `/login.html` y accede al panel administrativo.
2. Desde el panel abre **Proyectar QR** en una pantalla separada, sin controles administrativos visibles.
3. Los estudiantes escanean, completan datos válidos y entran automáticamente a su pantalla privada.
4. En **Preguntas**, ajusta y guarda el cuestionario.
5. En **Cuestionario**, pulsa **Iniciar desde la primera**, luego **Mostrar respuesta** y **Siguiente**.
6. La ruleta no está dentro del panel del cuestionario. Se abre por separado en `/ruleta.html`; selecciona un participante sin premio y pulsa **Girar**.

## Copia de seguridad

En Render el archivo activo es `/var/data/store.json`; `store.json.bak` conserva la versión anterior. Desde **Participantes** descarga el CSV y el respaldo JSON completo después de cada evento. No subas estos archivos a GitHub. Consulta el procedimiento de recuperación en [DEPLOY_RENDER.md](DEPLOY_RENDER.md).

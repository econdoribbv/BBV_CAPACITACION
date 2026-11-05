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
- Persistencia local en `data/store.json`; en Render requiere disco montado en `/var/data`.
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

**Un deploy de código no crea el disco.** Configura un servicio de pago compatible con discos, monta 1 GB en `/var/data` y establece `DATA_DIR=/var/data`. El propietario debe revisar y aceptar los costos en Render. Conserva `SESSION_SECRET` como variable privada. Las cuatro cuentas usan los hashes incluidos en el proyecto; las variables `*_PASSWORD_HASH` son opcionales para rotaciones posteriores.

Sin un disco montado realmente, Render puede mostrar la web y exportar datos existentes, pero los nuevos registros y cambios quedan bloqueados para evitar otra pérdida. El aviso del panel confirma cuándo está activo el almacenamiento persistente.

## Operación durante la feria

1. El organizador entra por `/login.html` y accede al panel administrativo.
2. Desde el panel abre **Proyectar QR** en una pantalla separada, sin controles administrativos visibles.
3. Los estudiantes escanean, completan datos válidos y entran automáticamente a su pantalla privada.
4. En **Preguntas**, ajusta y guarda el cuestionario.
5. En **Cuestionario**, pulsa **Iniciar desde la primera**, luego **Mostrar respuesta** y **Siguiente**.
6. La ruleta no está dentro del panel del cuestionario. Se abre por separado en `/ruleta.html`; selecciona un participante sin premio y pulsa **Girar**.

## Copia de seguridad

En Render el archivo activo es `/var/data/store.json`; `store.json.bak` conserva la versión anterior. Desde **Participantes** descarga el CSV y el respaldo JSON completo después de cada evento. No subas estos archivos a GitHub. Consulta el procedimiento de recuperación en [DEPLOY_RENDER.md](DEPLOY_RENDER.md).

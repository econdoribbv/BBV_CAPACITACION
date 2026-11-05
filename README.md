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

Para una prueba local inmediata, las credenciales iniciales son:

| Usuario | Contraseña local predeterminada |
| --- | --- |
| `admin` | `AdminFeria2026!` |
| `cjustiniano` | Clave restablecida y entregada al responsable; solo se almacena su hash bcrypt. |
| `dpinto` | `Dpinto2026!` |
| `avega` | `BBVAvega2026!` |

Las claves predeterminadas de los otros usuarios son solo para revisión local. En Render se deben configurar como variables privadas. `cjustiniano` usa el hash de `staff-credentials.json`, reemplazable mediante `CJUSTINIANO_PASSWORD_HASH`; la antigua variable `CJUSTINIANO_PASSWORD` ya no se utiliza.

## Publicar en GitHub y Render

Sigue [DEPLOY_RENDER.md](DEPLOY_RENDER.md) para actualizar el servicio existente.

**Un deploy de código no crea el disco.** Configura un servicio de pago compatible con discos, monta 1 GB en `/var/data` y establece `DATA_DIR=/var/data`. El propietario debe revisar y aceptar los costos en Render. Conserva `SESSION_SECRET`, `ADMIN_PASSWORD`, `DPINTO_PASSWORD` y `AVEGA_PASSWORD` como variables privadas. Para `cjustiniano`, se utiliza el hash de la clave restablecida incluido en el proyecto; una rotación posterior puede usar `CJUSTINIANO_PASSWORD_HASH`.

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

# Conecta & Participa — plataforma BBV

Aplicación web para registrar estudiantes mediante QR, ejecutar un cuestionario en vivo y entregar premios con una ruleta controlada por inventario.

## Funciones incluidas

- Registro con nombre, correo, género y rango de edad (18–23 o 24–28).
- Ingreso automático al cuestionario después de completar un registro válido.
- QR de registro generado con la URL pública configurada.
- Cuatro accesos de organizador: `admin`, `cjustiniano`, `dpinto` y `avega`.
- Cuestionario en vivo por juegos consecutivos (mínimo 3 participantes) que avanza solo con el tiempo de cada pregunta.
- Editor de preguntas desde el panel.
- Ruleta con los 5 mejores puntajes de cada juego: se abre sola al terminar, muestra el turno automáticamente y gira al tocar el centro.
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
2. Abre **Proyectar preguntas** en la pantalla del público. En la sala de espera se muestra el QR de registro, así que no hace falta descargarlo. **Proyectar QR** también lo abre en una pantalla aparte, con opción de pantalla completa.
3. Los estudiantes escanean, completan sus datos y entran a la sala del juego abierto. Si ya hay un juego en curso, esperan el siguiente.
4. Con al menos 3 participantes en sala, el organizador pulsa **Iniciar juego**.
5. El juego avanza solo. Al terminar el tiempo de cada pregunta se bloquean las respuestas, se muestra la respuesta correcta unos segundos y empieza la siguiente pregunta. Si todos responden antes, la pregunta se cierra en ese momento.
6. Al terminar la última pregunta, o si el organizador pulsa **Finalizar juego**, la proyección muestra los 5 mejores puntajes y abre la ruleta automáticamente.
7. En la ruleta aparece solo el nombre del siguiente ganador. El organizador toca el centro de la ruleta y se asigna el premio. La ruleta proyectada no muestra cantidades de premios; el inventario está en **Resumen** del panel.
8. Para el siguiente grupo, pulsa **Nuevo juego** (o directamente **Iniciar juego**). Quienes llegaron durante el juego anterior se suman automáticamente.
9. Cada correo puede jugar como máximo 3 veces. Al terminar su juego, el participante ve el botón **Jugar otra vez**.

Los jugadores no ven su posición, solo su puntaje. El informe CSV incluye a todas las personas de todos los juegos, con número de juego, puntaje, posición y premio.

## Copia de seguridad

En Render el archivo activo es `/var/data/store.json`; `store.json.bak` conserva la versión anterior. Desde **Participantes** descarga el CSV y el respaldo JSON completo después de cada evento. No subas estos archivos a GitHub. Consulta el procedimiento de recuperación en [DEPLOY_RENDER.md](DEPLOY_RENDER.md).

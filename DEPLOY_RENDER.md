# Activar esta versión en el servicio existente

Los cambios de código no crean almacenamiento persistente por sí solos. Un servicio gratuito de Render pierde sus archivos al reiniciar, suspenderse o desplegar. No habilites una feria hasta ver **Almacenamiento persistente activo** en el panel.

1. En el servicio existente `srv-da86f1cs728c73as33hg`, conserva el repositorio `econdoribbv/BBV_CAPACITACION` y la rama `main`.
2. Si está en Free, selecciona una instancia de pago compatible con discos. Revisa y acepta el precio en Render. Este cambio no se ha contratado desde el repositorio.
3. Agrega un disco persistente de 1 GB con **Mount path `/var/data`**. Agregar el disco puede iniciar un despliegue automáticamente.
4. En Environment, establece `DATA_DIR=/var/data` y conserva `SESSION_SECRET`. Las cuatro cuentas usan los hashes incluidos en el proyecto. Para los QR puedes establecer `PUBLIC_URL` con la URL pública HTTPS del servicio.
5. Usa `npm ci` como Build Command y `npm start` como Start Command. Mantén una sola instancia del servidor (el archivo de datos se usa desde un único proceso).
6. Haz **Manual Deploy → Deploy latest commit**. Si usas Blueprint, sincroniza su configuración; un deploy de código normal no aplica automáticamente los cambios de `render.yaml`.
7. Abre `/login.html`, entra al panel y confirma el aviso verde de almacenamiento persistente. Registra una persona de prueba desde otra sesión; descarga el CSV y el respaldo. Reinicia el servicio y confirma que ese registro sigue presente antes del evento.

El Blueprint no agrega un disco ni cambia de plan automáticamente: esa contratación queda a cargo del propietario. Se establece `autoDeployTrigger: off` para los servicios gestionados por Blueprint; en servicios creados manualmente, desactiva Auto-Deploy en el panel si quieres controlar cada publicación.

## Accesos

URL pública comprobada del proyecto: **https://conecta-y-participa-bbv.onrender.com**.

- [Participantes](https://conecta-y-participa-bbv.onrender.com/?registro=1)
- [Administración](https://conecta-y-participa-bbv.onrender.com/login.html) (panel: `/admin.html`)
- [Ruleta con MAX](https://conecta-y-participa-bbv.onrender.com/ruleta.html) (ruleta autenticada: `/wheel.html`)
- [QR](https://conecta-y-participa-bbv.onrender.com/qr.html)

**Las cuatro cuentas:** `admin`, `cjustiniano`, `dpinto` y `avega` usan hashes bcrypt en `staff-credentials.json`. Por solicitud del propietario, se restablecieron las claves de `admin`, `cjustiniano` y `dpinto`; se conservó la clave verificada de `avega`. Las claves se entregan al responsable fuera del repositorio. Las antiguas variables `*_PASSWORD` se ignoran deliberadamente: desplegar este cambio aplica los accesos corregidos. Para futuras rotaciones, las variables `ADMIN_PASSWORD_HASH`, `CJUSTINIANO_PASSWORD_HASH`, `DPINTO_PASSWORD_HASH` y `AVEGA_PASSWORD_HASH` admiten hashes bcrypt válidos y tienen prioridad. Las cuatro cuentas conservan los mismos permisos de organizador. El cambio no modifica los datos del evento ni los requisitos de almacenamiento.

## Respaldo y recuperación

- El archivo activo es `/var/data/store.json`; `store.json.bak` conserva la versión anterior a la última escritura confirmada. No subas ninguno a GitHub: contienen correos y otros datos personales.
- El panel **Participantes** permite descargar el informe CSV y un respaldo JSON completo. El CSV incluye todos los registros aunque la tabla tenga una búsqueda activa. Guarda el JSON fuera de Render al terminar cada evento.
- Las escrituras usan archivo temporal, sincronización a disco y reemplazo atómico. Si una escritura falla, se revierte el estado en memoria y se bloquean nuevas escrituras hasta reiniciar con el problema resuelto.
- Un JSON corrupto detiene el arranque: nunca se reemplaza automáticamente por una base vacía. Conserva el archivo dañado y recupera una copia verificada; `.bak` puede tener un registro menos que el archivo activo. Para restaurar, detén el servicio y coloca el respaldo completo como `/var/data/store.json` antes de reiniciar.
- Si no hay un disco montado realmente, la web permite consultar y exportar datos existentes, pero responde 503 a nuevos registros o cambios. Configurar solo `DATA_DIR` no elude esta protección.
- Este cambio previene nuevas pérdidas por almacenamiento temporal; no recupera registros borrados en despliegues anteriores.

Documentación: https://render.com/docs/disks y https://render.com/docs/free

## Verificación local

```sh
npm ci
npm run check
npm test
```

Las pruebas usan carpetas temporales aisladas y no modifican los datos del evento. Para revisar la interfaz, ejecuta `npm start`. La suite visual opcional usa Playwright: `npx playwright install chromium` y `npm run test:ui` (o define `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` con un Chrome instalado).

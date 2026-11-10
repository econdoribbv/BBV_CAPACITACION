# Desplegar y probar en Render Free

El registro y la ruleta funcionan sin contratar un disco. El bloqueo por falta de disco fue retirado.

1. En el servicio existente, selecciona Manual Deploy → Deploy latest commit.
2. Abre la página de participantes y registra una persona de prueba.
3. Entra al panel con cualquiera de las cuatro cuentas y comprueba el registro, la descarga en Excel y la ruleta.

## Dónde se guardan los datos

- Si existe un disco persistente montado y DATA_DIR apunta a él, se usa ese disco.
- En Render Free, se usa data/store.json dentro del servidor. Se conserva la escritura atómica y la copia anterior store.json.bak.
- Es almacenamiento temporal: Render puede eliminar esos archivos al reiniciar, suspender o desplegar. No se presenta como persistencia permanente.
- Descarga el Excel y el respaldo completo JSON durante y al terminar el evento, antes de reiniciar o desplegar.
- Un archivo dañado no se reemplaza por una base vacía. Un fallo real de escritura sí bloquea cambios para no confirmar registros que no se guardaron.
- Conservar datos entre despliegues requiere almacenamiento externo persistente; ese servicio puede tener una opción gratuita. Este cambio no configura ni contrata uno.

## Accesos

- Participantes: https://conecta-y-participa-bbv.onrender.com/
- Administración: https://conecta-y-participa-bbv.onrender.com/login.html
- Ruleta: https://conecta-y-participa-bbv.onrender.com/ruleta.html
- QR: https://conecta-y-participa-bbv.onrender.com/qr.html
- Proyección: https://conecta-y-participa-bbv.onrender.com/projector.html

## Cuentas

admin, cjustiniano, dpinto y avega mantienen permisos de organizador. Sus hashes bcrypt están en staff-credentials.json. Las claves se entregaron al propietario fuera del repositorio. Las antiguas variables de texto plano *_PASSWORD se ignoran. Para futuras rotaciones pueden configurarse ADMIN_PASSWORD_HASH, CJUSTINIANO_PASSWORD_HASH, DPINTO_PASSWORD_HASH o AVEGA_PASSWORD_HASH.

## Verificación

npm test comprueba las cuatro cuentas, el registro y giro sin disco, exportación y manejo de archivos. npm run test:ui comprueba la interfaz con Playwright. Las pruebas usan datos aislados, no los del evento.

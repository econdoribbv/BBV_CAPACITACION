# 🎨 Paleta de Colores — El Juego de la Bolsa (BBV)

> Documento de referencia para el diseño de la aplicación.
> Fuente: Manual de marca BBV, sección 3.8 "Valores de color para medios digitales".
> Los colores **principales** y **secundarios** son de marca y NO deben alterarse.
> Los colores de la sección "Extras del juego" son propuestos para necesidades funcionales de la app.

---

## 1. Colores PRINCIPALES

### Verde BBV (color primario de marca)

| Variante | HEX | RGB | Uso sugerido en la app |
|---|---|---|---|
| Verde 100% | `#36BC87` | 54, 188, 135 | Color protagonista: botones principales, logo, encabezados, subidas de precio |
| Verde 70% | `#64C79E` | 100, 199, 158 | Estados hover, fondos de tarjetas destacadas |
| Verde 40% | `#8AD5B7` | 138, 213, 183 | Fondos suaves, badges, filas seleccionadas |

### Morado BBV (color primario de marca)

| Variante | HEX | RGB | Uso sugerido en la app |
|---|---|---|---|
| Morado 100% | `#654388` | 101, 67, 136 | Segundo protagonista: barras de navegación, títulos, vista broker |
| Morado 70% | `#6D52A0` | 109, 82, 160 | Botones secundarios, estados hover |
| Morado 40% | `#816BB0` | 129, 107, 176 | Fondos suaves, bordes, elementos decorativos |

---

## 2. Colores SECUNDARIOS

> Según el manual: para ilustraciones, comunicaciones de procesos, relaciones y contextos.

### Naranja

| Variante | HEX | RGB |
|---|---|---|
| Naranja 100% | `#F7941E` | 247, 148, 30 |
| Naranja 70% | `#FAA74A` | 250, 167, 74 |
| Naranja 40% | `#FCBB76` | 252, 187, 118 |

### Celeste

| Variante | HEX | RGB |
|---|---|---|
| Celeste 100% | `#59C8E1` | 89, 200, 225 |
| Celeste 70% | `#9ADAEA` | 154, 218, 234 |
| Celeste 40% | `#CCEBF3` | 204, 235, 243 |

### Rosado

| Variante | HEX | RGB |
|---|---|---|
| Rosado 100% | `#E8519D` | 232, 81, 157 |
| Rosado 70% | `#EF99C1` | 239, 153, 193 |
| Rosado 40% | `#F9DBE9` | 249, 219, 233 |

### ⚠️ Correcciones aplicadas sobre la tabla original

Estos valores tenían errores de tipeo en la transcripción; se corrigieron usando el RGB del manual como fuente de verdad:

| Color | Valor transcrito (erróneo) | Valor correcto | Motivo |
|---|---|---|---|
| Verde 70% | `#64c78e` | `#64C79E` | RGB 100,199,158 → 158 = `9E` |
| Celeste 70% | RGB "154,218,135" | RGB 154,218,234 | `#9ADAEA` = 154,218,234 (135 era tipeo) |
| Celeste 40% | RGB "78,188,135" | RGB 204,235,243 | `#CCEBF3` = 204,235,243 (el RGB anotado era del verde) |
| Rosado 100% | `#FCBB76` | `#E8519D` | RGB 232,81,157 → `#E8519D` (el hex anotado era del naranja) |
| Rosado 70% | `#EF99CI` | `#EF99C1` | "I" no es hexadecimal; RGB 239,153,193 → `C1` |

---

## 3. Neutros (extras del juego)

Base neutra para fondos, textos y superficies. Derivada para armonizar con la marca.

| Nombre | HEX | Uso |
|---|---|---|
| Blanco | `#FFFFFF` | Fondo base vista jugador (celular), texto sobre colores |
| Gris claro | `#F4F4F6` | Fondo de secciones, tarjetas en reposo |
| Gris medio | `#C9C9D1` | Bordes, divisores, estados deshabilitados |
| Gris texto | `#6B6B76` | Texto secundario, etiquetas |
| Carbón | `#2B2734` | Texto principal (tono cálido hacia el morado) |
| Fondo oscuro tablero | `#1E1930` | Fondo de la vista TABLERO proyectada (morado casi negro: alto contraste en proyector) |
| Superficie oscura | `#2E2745` | Paneles/tarjetas sobre el fondo oscuro del tablero |

> **Regla de proyección:** la vista Tablero usa fondo oscuro (`#1E1930`) con textos claros — en proyectores con poca luminosidad el contraste oscuro→claro se lee mucho mejor que fondos blancos.

---

## 4. Semánticos del juego (extras del juego)

Colores funcionales para la mecánica del juego. El rojo es un **extra necesario** (la marca no incluye uno) para caídas de precio y alertas — universal en contexto bursátil.

| Nombre | HEX | Uso |
|---|---|---|
| Subida / Ganancia | `#36BC87` | Precio que sube, variación positiva, flechas ↑ (mismo verde de marca) |
| Bajada / Pérdida | `#E14B4B` | Precio que baja, variación negativa, flechas ↓ |
| Bajada suave | `#F5C8C8` | Fondos de celdas con variación negativa |
| Alerta / Peligro | `#E14B4B` | Precio tocando el piso (10), equipo en riesgo de eliminación |
| Advertencia | `#F7941E` | Temporizador en últimos 30 seg., avisos (naranja de marca) |
| Información | `#59C8E1` | Mensajes informativos, tooltips (celeste de marca) |
| Dividendos | `#F2C94C` | Momento de pago de dividendos, precio tocando el techo (250) — dorado festivo |
| Éxito confirmado | `#36BC87` | Transacción registrada, confirmaciones |

---

## 5. Colores por EMPRESA (extras del juego)

Cada empresa del juego necesita una identidad de color constante en tablero, gráfico, tarjetas y portafolios. Asignación desde la paleta de marca (el verde se reserva para "subida" y no identifica empresas):

| Empresa | Color | HEX | Tinte para fondos |
|---|---|---|---|
| INTI | Morado | `#654388` | `#816BB0` |
| SOFIA | Naranja | `#F7941E` | `#FCBB76` |
| TIGO | Celeste | `#59C8E1` | `#CCEBF3` |
| CBN | Rosado | `#E8519D` | `#F9DBE9` |

> Como la cantidad de empresas es configurable, si se agregan más se continúa con: Dorado `#F2C94C`, Verde azulado `#2E9E9B`, Azul `#4A6FD4`, Terracota `#C4674E` (extras propuestos, armonizados con la marca).

---

## 6. Asignación por vista

| Vista | Fondo | Color dominante | Acentos |
|---|---|---|---|
| **Tablero (proyector)** | `#1E1930` | Colores de empresa + verde/rojo de variación | Dorado en dividendos, naranja en timer |
| **Broker (laptop)** | `#F4F4F6` | Morado `#654388` (autoridad/control) | Verde en acciones de confirmación |
| **Jugador (celular)** | `#FFFFFF` | Verde `#36BC87` (acción/participación) | Color de la empresa que esté operando |

---

## 7. Tokens listos para implementación (CSS / Tailwind)

```css
:root {
  /* Marca — principales */
  --verde-100: #36BC87;  --verde-70: #64C79E;  --verde-40: #8AD5B7;
  --morado-100: #654388; --morado-70: #6D52A0; --morado-40: #816BB0;
  /* Marca — secundarios */
  --naranja-100: #F7941E; --naranja-70: #FAA74A; --naranja-40: #FCBB76;
  --celeste-100: #59C8E1; --celeste-70: #9ADAEA; --celeste-40: #CCEBF3;
  --rosado-100: #E8519D;  --rosado-70: #EF99C1;  --rosado-40: #F9DBE9;
  /* Neutros */
  --blanco: #FFFFFF; --gris-claro: #F4F4F6; --gris-medio: #C9C9D1;
  --gris-texto: #6B6B76; --carbon: #2B2734;
  --fondo-tablero: #1E1930; --superficie-tablero: #2E2745;
  /* Semánticos */
  --sube: #36BC87; --baja: #E14B4B; --baja-suave: #F5C8C8;
  --alerta: #E14B4B; --advertencia: #F7941E; --info: #59C8E1;
  --dividendos: #F2C94C;
  /* Empresas */
  --emp-inti: #654388; --emp-sofia: #F7941E;
  --emp-tigo: #59C8E1; --emp-cbn: #E8519D;
}
```

---

## 8. Reglas de uso

1. **Verde y morado mandan.** Toda pantalla debe percibirse "BBV": si un elemento no es semántico ni de empresa, usa verde o morado.
2. **El rojo solo significa pérdida o peligro.** Nunca usarlo decorativamente.
3. **El color de empresa es constante** en todas las vistas y gráficos: TIGO siempre celeste, en todos lados.
4. **Contraste mínimo AA (4.5:1)** para texto. Sobre `#36BC87` y `#59C8E1` usar texto carbón `#2B2734`; sobre `#654388` usar texto blanco.
5. **Tintes 70%/40% solo como fondos o estados** (hover, seleccionado, deshabilitado), nunca como color de texto.
6. **Patrón de hexágonos** (visto en las tarjetas físicas) puede usarse como textura de fondo sutil con los tintes 40% y opacidad baja.

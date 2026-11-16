// Banco de Preguntas para la Evaluación de Requerimientos Funcionales - GTI BBV
// Basado en el documento oficial: Capacitacion_Elaboracion_de_Requerimientos_Funcionales.docx

const questions10 = [
    {
        id: 1,
        type: 'fill',
        title: 'Regla de Oro en la especificación de requerimientos',
        module: 'Módulo 4: Estructura mínima de un buen requerimiento',
        question: 'Complete los espacios en blanco del párrafo fundamental de la capacitación:',
        template: '« Si una condición puede cambiar el {1} del proceso, debe quedar {2}. Si un dato es necesario para decidir, calcular, aprobar, rechazar o reportar, debe quedar {3}. »',
        options: [
            { id: 'a', text: 'resultado | escrita | definido' },
            { id: 'b', text: 'tiempo | borrador | estimado' },
            { id: 'c', text: 'código | aprobada | eliminado' },
            { id: 'd', text: 'costo | implícita | flexible' }
        ],
        correct: ['a'],
        blanks: ['resultado', 'escrita', 'definido'],
        wordBank: ['escrita', 'resultado', 'definido', 'código', 'estimado', 'borrador'],
        explanation: 'Módulo 4 (Regla de Oro): Todo lo que cambie el resultado debe quedar escrito, y todo dato necesario para decidir, calcular o aprobar debe quedar definido.',
        points: 10
    },
    {
        id: 2,
        type: 'fill',
        title: 'Traducción de conocimiento y roles funcionales',
        module: 'Módulo 19: Mensajes de cierre y frase final',
        question: 'Complete los espacios en blanco sobre la relación entre el negocio y el proveedor:',
        template: '« El proveedor debe convertir {1} en software; el equipo funcional debe convertir {2} en requerimientos. La calidad del {3} depende de la calidad de esa traducción. »',
        options: [
            { id: 'a', text: 'pantallas | manuales | sistema' },
            { id: 'b', text: 'requerimientos | conocimiento del negocio | resultado' },
            { id: 'c', text: 'algoritmos | presupuestos | plazo' },
            { id: 'd', text: 'código | supuestos | entregable' }
        ],
        correct: ['b'],
        blanks: ['requerimientos', 'conocimiento del negocio', 'resultado'],
        wordBank: ['requerimientos', 'conocimiento del negocio', 'resultado', 'presupuesto', 'pantallas', 'algoritmos'],
        explanation: 'Módulo 19: El proveedor convierte especificaciones en software, pero el equipo funcional debe transformar la sabiduría y operativa del negocio en requerimientos sin supuestos.',
        points: 10
    },
    {
        id: 3,
        type: 'single',
        title: 'Propósito del requerimiento funcional',
        module: 'Módulo 1 y 2: Concepto y Roles',
        question: '¿Cuál es el propósito primordial de un requerimiento funcional desde la perspectiva del equipo de negocio?',
        options: [
            { id: 'a', text: 'Explicar al desarrollador qué tablas de base de datos, lenguajes y librerías técnicas debe utilizar.' },
            { id: 'b', text: 'Describir qué necesita el negocio, bajo qué reglas debe operar la solución y cómo sabremos que el resultado es correcto.' },
            { id: 'c', text: 'Diseñar la arquitectura técnica de servidores, puertos y protocolos de red de la infraestructura.' },
            { id: 'd', text: 'Presentar una propuesta de diseño gráfico visual sin detallar excepciones ni validaciones de fondo.' }
        ],
        correct: ['b'],
        explanation: 'Módulo 1: Desde la perspectiva funcional no se trata de explicar cómo programar, sino de explicar qué necesita el negocio, bajo qué reglas debe funcionar y cómo sabremos que el resultado es correcto.',
        points: 10
    },
    {
        id: 4,
        type: 'single',
        title: 'El problema de los supuestos en el negocio',
        module: 'Módulo 1: El problema de los supuestos',
        question: 'En las instituciones existen reglas que se consideran «obvias» porque el equipo las aplica a diario. Según la capacitación, ¿qué sucede si estas reglas NO se documentan?',
        options: [
            { id: 'a', text: 'El desarrollador siempre las deducirá de manera intuitiva y correcta al escribir el código.' },
            { id: 'b', text: 'El proveedor se ve forzado a preguntar, interpretar o no implementarlas; las dos últimas generan retrabajo y riesgo.' },
            { id: 'c', text: 'El sistema operará sin fallas porque las políticas institucionales son de conocimiento público.' },
            { id: 'd', text: 'Se reduce el tiempo de desarrollo al no sobrecargar el requerimiento con reglas cotidianas.' }
        ],
        correct: ['b'],
        explanation: 'Módulo 1: Para un proveedor externo esas reglas no son obvias. Si no están documentadas, existen tres posibilidades: el proveedor pregunta, interpreta o simplemente no las implementa. Las dos últimas generan retrabajo y riesgo.',
        points: 10
    },
    {
        id: 5,
        type: 'single',
        title: 'Niveles de abstracción: De la necesidad al requerimiento',
        module: 'Módulo 3: De la necesidad al requerimiento',
        question: 'Si un analista redacta: «Dado un monto de 0, al presionar Guardar, la operación no se registra y se muestra el mensaje "El monto debe ser mayor a cero"», ¿a qué nivel de especificación corresponde este enunciado?',
        options: [
            { id: 'a', text: 'Necesidad de negocio (problema u oportunidad general).' },
            { id: 'b', text: 'Objetivo general de la solución.' },
            { id: 'c', text: 'Requerimiento no funcional de rendimiento o infraestructura.' },
            { id: 'd', text: 'Criterio de aceptación observable y verificable.' }
        ],
        correct: ['d'],
        explanation: 'Módulo 3: El documento de capacitación enseña 4 niveles: 1) Necesidad ("reducir errores"), 2) Objetivo ("validar automáticamente"), 3) Requerimiento funcional ("impedir guardar si monto <= 0"), y 4) Criterio de Aceptación observable bajo el formato Dado/Cuando/Entonces («Dado un monto de 0, al presionar Guardar, no se registra y muestra mensaje...»). Por tanto, la respuesta correcta es la opción D.',
        points: 10
    },
    {
        id: 6,
        type: 'single',
        title: 'Estructura rigurosa de una validación',
        module: 'Módulo 8: Validaciones, mensajes y comportamiento ante errores',
        question: 'Al redactar una validación en el requerimiento, ¿cuál es la estructura mínima exigida para que sea verificable y no ambigua?',
        options: [
            { id: 'a', text: 'Indicar únicamente «validar los datos antes de continuar» y dejar el comportamiento a criterio del programador.' },
            { id: 'b', text: 'Definir la condición que se controla, la acción del sistema (bloquear o advertir) y el mensaje visible exacto para el usuario.' },
            { id: 'c', text: 'Especificar únicamente el nombre del campo en la base de datos sin redactar mensajes de advertencia.' },
            { id: 'd', text: 'Adjuntar una captura de pantalla de otro sistema sin definir el texto ni la lógica esperada.' }
        ],
        correct: ['b'],
        explanation: 'Módulo 8: No basta con indicar "validar". Se debe precisar qué condición se controla, la acción del sistema (bloquear o advertir) y el mensaje visible exacto que verá el usuario.',
        points: 10
    },
    {
        id: 7,
        type: 'single',
        title: 'Gestión de cambios vs. Aclaraciones',
        module: 'Módulo 13: Trazabilidad y gestión de cambios',
        question: '¿Cuál de las siguientes situaciones califica estrictamente como un CAMBIO DE ALCANCE y no como una simple aclaración?',
        options: [
            { id: 'a', text: 'Precisar el formato visual de una fecha (DD/MM/AAAA) que ya estaba contemplada en el alcance aprobado.' },
            { id: 'b', text: 'Explicar el significado operativo de una sigla de negocio incluida previamente en el flujo principal.' },
            { id: 'c', text: 'Incorporar una nueva regla que exige la aprobación de un segundo perfil cuando el monto supere los 50.000 BOB.' },
            { id: 'd', text: 'Indicar que el botón "Cancelar" debe retornar al usuario a la pantalla de búsqueda previamente definida.' }
        ],
        correct: ['c'],
        explanation: 'Módulo 13: Una aclaración precisa algo dentro de la intención original. Un cambio agrega, elimina o modifica comportamiento, reglas, datos, interfaces o criterios acordados.',
        points: 10
    },
    {
        id: 8,
        type: 'multi',
        title: 'Detección de palabras peligrosas y ambiguas',
        module: 'Módulo 11: Palabras peligrosas: parecen claras, pero no lo son',
        question: '¿Cuáles de las siguientes expresiones son consideradas «peligrosas» al redactar requerimientos porque parecen claras pero esconden ambigüedad? (Seleccione todas las que correspondan)',
        options: [
            { id: 'a', text: '«Automáticamente» (no aclara qué evento lo dispara, cuándo se ejecuta ni qué ocurre si falla).' },
            { id: 'b', text: '«Según corresponda» (no define cuáles son exactamente las condiciones ni las alternativas aplicables).' },
            { id: 'c', text: '«Fecha de vencimiento estrictamente posterior a la fecha de emisión».' },
            { id: 'd', text: '«Rápido» (no define un tiempo objetivo de respuesta ni condiciones de concurrencia).' },
            { id: 'e', text: '«Información necesaria» (no especifica la lista exhaustiva de campos obligatorios).' }
        ],
        correct: ['a', 'b', 'd', 'e'],
        explanation: 'Módulo 11: "Automáticamente", "según corresponda", "rápido" e "información necesaria" son términos ambiguos que trasladan supuestos. La opción c es una condición precisa.',
        points: 10
    },
    {
        id: 9,
        type: 'multi',
        title: 'Tipos comunes de reglas de negocio',
        module: 'Módulo 5: Reglas de negocio: el conocimiento que el proveedor no puede adivinar',
        question: 'Las reglas de negocio reflejan políticas institucionales y decisiones operativas. ¿Cuáles de las siguientes corresponden a tipos formales explicados en la capacitación? (Seleccione todas las que correspondan)',
        options: [
            { id: 'a', text: 'Reglas de Validación (ej. «No se puede registrar una fecha futura»).' },
            { id: 'b', text: 'Reglas de Cálculo (ej. «Comisión = monto × porcentaje tarifario con redondeo a 2 decimales»).' },
            { id: 'c', text: 'Reglas de Autorización (ej. «Montos superiores a X requieren aprobación de un segundo perfil»).' },
            { id: 'd', text: 'Reglas de Derivación (ej. «Si la operación es rechazada, retornar al originador con motivo»).' },
            { id: 'e', text: 'Reglas de Cableado Estructurado y Fibra Óptica.' }
        ],
        correct: ['a', 'b', 'c', 'd'],
        explanation: 'Módulo 5: En el documento de capacitación se enseñan 6 tipos formales de reglas de negocio: Validación, Cálculo, Autorización, Clasificación, Derivación y Vigencia. Por tanto, las opciones A, B, C y D corresponden directamente a estos tipos. La opción E (cableado y fibra óptica) es un componente de infraestructura física, no una regla funcional.',
        points: 10
    },
    {
        id: 10,
        type: 'multi',
        title: 'Errores frecuentes al levantar requerimientos',
        module: 'Módulo 12: Errores frecuentes y su impacto',
        question: '¿Cuáles de las siguientes prácticas constituyen ERRORES FRECUENTES que generan graves riesgos de retrabajo y fallas en el proyecto? (Seleccione todas las que correspondan)',
        options: [
            { id: 'a', text: 'Describir únicamente la pantalla visual, omitiendo reglas de cálculo, estados y excepciones.' },
            { id: 'b', text: 'Suponer que el proveedor «ya sabe» cómo funciona el negocio institucional.' },
            { id: 'c', text: 'Cambiar el alcance verbalmente en reuniones sin actualizar formalmente el requerimiento.' },
            { id: 'd', text: 'Aceptar una entrega por apariencia visual («se ve bien») sin comprobar la lógica con casos de prueba.' },
            { id: 'e', text: 'Aplicar la técnica de «lectura de tercero» antes de enviar el documento al proveedor.' }
        ],
        correct: ['a', 'b', 'c', 'd'],
        explanation: 'Módulo 12: Las opciones a, b, c y d son errores críticos. La opción e (lectura de tercero) es una buena práctica recomendada para prevenir omisiones.',
        points: 10
    }
];

const questions20 = [
    {
        id: 1,
        type: 'fill',
        title: 'Idea Clave Inicial: Roles y Omisiones en el Sistema',
        module: 'Módulo 1: Idea Clave',
        question: 'Complete los espacios en blanco del principio rector de la capacitación:',
        template: '« El proveedor conoce {1} y tecnología. El equipo funcional conoce el {2}. Si las reglas del negocio, excepciones, datos y criterios esperados no están {3}, el desarrollador no tiene una base objetiva para incorporarlos. Una omisión en el requerimiento suele convertirse en una {4} en el sistema. »',
        options: [
            { id: 'a', text: 'programación | negocio | escritos | omisión' },
            { id: 'b', text: 'servidores | proceso | aprobados | falla' },
            { id: 'c', text: 'presupuestos | cliente | definidos | multa' },
            { id: 'd', text: 'algoritmos | mercado | documentados | sugerencia' }
        ],
        correct: ['a'],
        blanks: ['programación', 'negocio', 'escritos', 'omisión'],
        wordBank: ['escritos', 'negocio', 'omisión', 'programación', 'infraestructura', 'sugerencia'],
        explanation: 'Módulo 1 (Idea Clave): Una omisión en el requerimiento suele convertirse en una omisión en el sistema porque el desarrollador carece de base objetiva para incorporarla.',
        points: 5
    },
    {
        id: 2,
        type: 'fill',
        title: 'Regla de Oro de la Especificación Funcional',
        module: 'Módulo 4: Estructura mínima de un buen requerimiento',
        question: 'Complete la Regla de Oro que rige la redacción de requerimientos:',
        template: '« Si una condición puede cambiar el {1} del proceso, debe quedar {2}. Si un dato es necesario para decidir, calcular, aprobar, rechazar o reportar, debe quedar {3}. »',
        options: [
            { id: 'a', text: 'resultado | escrita | definido' },
            { id: 'b', text: 'orden | registrada | estimado' },
            { id: 'c', text: 'código | codificada | verificado' },
            { id: 'd', text: 'estado | borrador | flexible' }
        ],
        correct: ['a'],
        blanks: ['resultado', 'escrita', 'definido'],
        wordBank: ['escrita', 'resultado', 'definido', 'flexible', 'estimado', 'programado'],
        explanation: 'Módulo 4: Todo lo que cambie el resultado debe quedar escrito, y todo dato necesario para decidir o reportar debe quedar definido.',
        points: 5
    },
    {
        id: 3,
        type: 'fill',
        title: 'Precisión vs. Ejemplos',
        module: 'Módulo 19: Mensajes de cierre',
        question: 'Complete los principios sobre precisión y uso de ejemplos:',
        template: '« Más detalle no significa más texto. Significa {1}: condiciones, datos, excepciones y resultados verificables. Un ejemplo ayuda, pero no {2} una regla. Primero se escribe la regla {3}; luego se agregan ejemplos. »',
        options: [
            { id: 'a', text: 'precisión | reemplaza | general' },
            { id: 'b', text: 'volumen | elimina | técnica' },
            { id: 'c', text: 'extensión | contradice | compleja' },
            { id: 'd', text: 'amplitud | asegura | visual' }
        ],
        correct: ['a'],
        blanks: ['precisión', 'reemplaza', 'general'],
        wordBank: ['reemplaza', 'precisión', 'general', 'excepción', 'complejidad', 'elimina'],
        explanation: 'Módulo 19: Un ejemplo ilustra pero no reemplaza la regla general. Mayor detalle significa rigor y precisión verificable.',
        points: 5
    },
    {
        id: 4,
        type: 'fill',
        title: 'El Requerimiento como Contrato de Entendimiento',
        module: 'Módulo 19: Mensajes de cierre',
        question: 'Complete los enunciados de gobernanza y cierre:',
        template: '« El requerimiento es un {1} de entendimiento. Su función principal es reducir {2} diferentes entre negocio y desarrollo. Lo que no se especifica no puede {3} objetivamente. »',
        options: [
            { id: 'a', text: 'contrato | interpretaciones | exigirse' },
            { id: 'b', text: 'trámite | opiniones | programarse' },
            { id: 'c', text: 'documento | discusiones | validarse' },
            { id: 'd', text: 'borrador | reuniones | cambiarse' }
        ],
        correct: ['a'],
        blanks: ['contrato', 'interpretaciones', 'exigirse'],
        wordBank: ['contrato', 'interpretaciones', 'exigirse', 'sugerirse', 'trámite', 'reuniones'],
        explanation: 'Módulo 19: El requerimiento formaliza el entendimiento común; lo no especificado no puede exigirse de manera objetiva.',
        points: 5
    },
    {
        id: 5,
        type: 'single',
        title: 'Concepto de requerimiento funcional',
        module: 'Módulo 1: ¿Qué es un requerimiento?',
        question: 'Desde la perspectiva del equipo funcional, ¿qué explica un requerimiento?',
        options: [
            { id: 'a', text: 'Cómo programar y qué tablas de base de datos indexar.' },
            { id: 'b', text: 'Qué necesita el negocio, bajo qué reglas debe operar y cómo sabremos que el resultado es correcto.' },
            { id: 'c', text: 'Qué sistema operativo y velocidad de procesador requiere el servidor.' },
            { id: 'd', text: 'Únicamente el presupuesto asignado y la fecha límite de pago al proveedor.' }
        ],
        correct: ['b'],
        explanation: 'Módulo 1: No se trata de explicar cómo programar, sino qué necesita el negocio y sus criterios de verificación.',
        points: 5
    },
    {
        id: 6,
        type: 'single',
        title: 'El peligro de los supuestos',
        module: 'Módulo 1: El problema de los supuestos',
        question: '¿Por qué las reglas operativas consideradas «obvias» representan un riesgo crítico si no quedan escritas?',
        options: [
            { id: 'a', text: 'Porque el proveedor externo no las conoce; si no están escritas, pregunta, interpreta o no las implementa (las dos últimas generan retrabajo y fallas).' },
            { id: 'b', text: 'Porque la base de datos no puede compilar reglas implícitas.' },
            { id: 'c', text: 'Porque la ley prohíbe que los desarrolladores tomen decisiones técnicas.' },
            { id: 'd', text: 'Porque los servidores web se saturan con supuestos no definidos.' }
        ],
        correct: ['a'],
        explanation: 'Módulo 1: Para el proveedor las reglas de negocio no son obvias. Interpretar o no implementar genera retrabajo y riesgo.',
        points: 5
    },
    {
        id: 7,
        type: 'single',
        title: 'Delimitación de roles: negocio vs proveedor',
        module: 'Módulo 2: Roles: quién sabe qué',
        question: 'Respecto a las responsabilidades entre el Negocio y el Proveedor, ¿cuál premisa es CORRECTA?',
        options: [
            { id: 'a', text: 'El negocio debe diseñar la arquitectura técnica y el proveedor define las políticas de la institución.' },
            { id: 'b', text: 'El proveedor es responsable de descubrir la normativa y reglas del negocio por ensayo y error.' },
            { id: 'c', text: 'El éxito aparece cuando el negocio especifica con precisión el «qué» y el proveedor diseña el «cómo».' },
            { id: 'd', text: 'Ninguna de las dos partes debe documentar precondiciones antes de comenzar a codificar.' }
        ],
        correct: ['c'],
        explanation: 'Módulo 2: El negocio define el qué (procesos, reglas, excepciones) y el proveedor el cómo técnico (arquitectura, construcción).',
        points: 5
    },
    {
        id: 8,
        type: 'single',
        title: 'Identificación de niveles de abstracción',
        module: 'Módulo 3: De la necesidad al requerimiento',
        question: 'Considere el enunciado: «El sistema debe impedir guardar una operación si el monto es menor o igual a cero». Corresponde al nivel de:',
        options: [
            { id: 'a', text: 'Necesidad de negocio.' },
            { id: 'b', text: 'Objetivo general.' },
            { id: 'c', text: 'Requerimiento funcional (comportamiento del sistema).' },
            { id: 'd', text: 'Criterio de aceptación verificable.' }
        ],
        correct: ['c'],
        explanation: 'Módulo 3: Describe el comportamiento directo que debe tener el sistema ante una condición de datos.',
        points: 5
    },
    {
        id: 9,
        type: 'single',
        title: 'Especificación de validaciones',
        module: 'Módulo 8: Validaciones y mensajes',
        question: 'Un requerimiento señala: «Validar que la fecha sea correcta». ¿Por qué es una redacción débil y deficiente?',
        options: [
            { id: 'a', text: 'Porque no define la condición exacta (ej. vencimiento posterior a emisión), qué acción toma el sistema (bloquear) ni el mensaje visible al usuario.' },
            { id: 'b', text: 'Porque las fechas nunca se validan en sistemas informáticos modernos.' },
            { id: 'c', text: 'Porque el término fecha es exclusivo de los administradores de redes.' },
            { id: 'd', text: 'Porque toda validación debe ser manual por el usuario.' }
        ],
        correct: ['a'],
        explanation: 'Módulo 8: Toda validación completa requiere condición + acción del sistema + mensaje visible.',
        points: 5
    },
    {
        id: 10,
        type: 'single',
        title: 'Especificación de reglas de cálculo',
        module: 'Módulo 5: Regla de cálculo',
        question: 'Al documentar una regla de cálculo (ej. tarifas o comisiones), ¿cuál práctica cumple con el estándar enseñado?',
        options: [
            { id: 'a', text: 'Colocar únicamente «Calcular la comisión correspondiente» para dar libertad al programador.' },
            { id: 'b', text: 'Detallar fórmula exacta, fuente de las tasas vigentes, criterio de redondeo y qué ocurre si falta una tarifa.' },
            { id: 'c', text: 'Enviar una captura de una calculadora física sin redactar la fórmula.' },
            { id: 'd', text: 'Permitir que el operador ingrese el valor que desee en cada transacción.' }
        ],
        correct: ['b'],
        explanation: 'Módulo 5: La fórmula, la fuente de parámetros, el redondeo matemático y la excepción ante falta de datos deben especificarse.',
        points: 5
    },
    {
        id: 11,
        type: 'single',
        title: 'Flujos y escenarios de excepción',
        module: 'Módulo 7: Flujos, escenarios y excepciones',
        question: '¿Por qué el manual insiste en que no es suficiente documentar el «flujo principal» (camino feliz)?',
        options: [
            { id: 'a', text: 'Porque en los sistemas reales, buena parte de los incidentes y errores operativos ocurre precisamente en excepciones y escenarios poco frecuentes.' },
            { id: 'b', text: 'Porque los flujos principales casi nunca se ejecutan en producción.' },
            { id: 'c', text: 'Porque el proveedor cobra una tarifa fija por cada excepción no documentada.' },
            { id: 'd', text: 'Porque los flujos alternos anulan los flujos principales.' }
        ],
        correct: ['a'],
        explanation: 'Módulo 7: En los sistemas reales, la gran mayoría de errores y caídas operativas se presenta en escenarios de error o excepciones no previstos.',
        points: 5
    },
    {
        id: 12,
        type: 'single',
        title: 'Formato de criterios de aceptación',
        module: 'Módulo 9: Criterios de aceptación',
        question: '¿Cuál es la estructura estándar recomendada para redactar criterios de aceptación objetivos y comprobables?',
        options: [
            { id: 'a', text: 'ANTES / DURANTE / DESPUÉS.' },
            { id: 'b', text: 'DADO [condición inicial] / CUANDO [acción o evento] / ENTONCES [resultado observable].' },
            { id: 'c', text: 'HIPÓTESIS / PRUEBA / CONCLUSIÓN.' },
            { id: 'd', text: 'QUIÉN / DÓNDE / POR QUÉ.' }
        ],
        correct: ['b'],
        explanation: 'Módulo 9: El formato DADO / CUANDO / ENTONCES asegura condiciones observables y pruebas sin ambigüedades.',
        points: 5
    },
    {
        id: 13,
        type: 'single',
        title: 'Requerimientos no funcionales (RNF)',
        module: 'Módulo 10: Requerimientos no funcionales',
        question: 'Respecto a los Requerimientos No Funcionales (disponibilidad, rendimiento, volumen, seguridad):',
        options: [
            { id: 'a', text: 'El equipo funcional no debe involucrarse por ser temas exclusivos de hardware.' },
            { id: 'b', text: 'El equipo funcional expresa la necesidad operativa del negocio y su impacto; el proveedor propone la métrica técnica que se acuerda formalmente.' },
            { id: 'c', text: 'El equipo de negocio debe programar los milisegundos de respuesta del microprocesador.' },
            { id: 'd', text: 'Solo se analizan una vez que el sistema ya colapsó en producción.' }
        ],
        correct: ['b'],
        explanation: 'Módulo 10: Cuando una cifra técnica no sea conocida por el negocio, el equipo funcional expresa la necesidad y el impacto; el proveedor propone la métrica acordada.',
        points: 5
    },
    {
        id: 14,
        type: 'single',
        title: 'Técnica de revisión: Lectura de tercero',
        module: 'Módulo 14: Técnica de revisión antes de enviar al proveedor',
        question: 'La técnica de revisión previa a remitir el documento denominada «Lectura de tercero» consiste en:',
        options: [
            { id: 'a', text: 'Contratar a tres empresas proveedoras simultáneas para cotizar el desarrollo.' },
            { id: 'b', text: 'Revisar el requerimiento como si no se conociera el proceso, detectando dudas que solo están en la cabeza del autor.' },
            { id: 'c', text: 'Comprobar únicamente que el documento tenga más de 100 páginas.' },
            { id: 'd', text: 'Pasar el texto por un traductor de idiomas automático.' }
        ],
        correct: ['b'],
        explanation: 'Módulo 14: Revisar como si no se conociera el proceso permite descubrir vacíos que solo existen en la mente del redactor.',
        points: 5
    },
    {
        id: 15,
        type: 'multi',
        title: 'Atributos obligatorios al definir datos y campos',
        module: 'Módulo 6: Datos y campos: no basta con decir registrar información',
        question: 'Al momento de solicitar campos o datos en un requerimiento, ¿cuáles aspectos deben quedar claramente definidos? (Seleccione todas las que correspondan)',
        options: [
            { id: 'a', text: 'Nombre claro y significado inequívoco en el negocio.' },
            { id: 'b', text: 'Tipo y formato de dato (texto, numérico, decimales, fecha, etc.).' },
            { id: 'c', text: 'Obligatoriedad (siempre, nunca o condicional).' },
            { id: 'd', text: 'Fuente del dato (usuario, catálogo del sistema o integración externa).' },
            { id: 'e', text: 'Editabilidad (en qué estados del flujo se puede modificar y por qué perfiles).' }
        ],
        correct: ['a', 'b', 'c', 'd', 'e'],
        explanation: 'Módulo 6: Los 5 aspectos forman la matriz esencial de definición de campos para evitar discrepancias posteriores.',
        points: 5
    },
    {
        id: 16,
        type: 'multi',
        title: 'Catálogo de palabras peligrosas y ambiguas',
        module: 'Módulo 11: Palabras peligrosas: parecen claras, pero no lo son',
        question: '¿Cuáles de las siguientes expresiones son identificadas como «palabras peligrosas» que deben sustituirse por condiciones concretas? (Seleccione todas las que correspondan)',
        options: [
            { id: 'a', text: '«Automáticamente» (sin indicar qué evento lo dispara ni qué pasa si falla).' },
            { id: 'b', text: '«Según corresponda» (sin detallar qué opciones aplican según cada condición).' },
            { id: 'c', text: '«Similar al sistema actual» (sin precisar qué se conserva y qué debe cambiar).' },
            { id: 'd', text: '«Los usuarios» (sin indicar perfiles, roles ni permisos específicos).' },
            { id: 'e', text: '«Monto mayor a cero con hasta dos decimales».' }
        ],
        correct: ['a', 'b', 'c', 'd'],
        explanation: 'Módulo 11: Las opciones a, b, c y d trasladan ambigüedad. La opción e es una regla cuantitativa y verificable.',
        points: 5
    },
    {
        id: 17,
        type: 'multi',
        title: 'Clasificación formal de reglas de negocio',
        module: 'Módulo 5: Tipos comunes de reglas',
        question: '¿Cuáles de las siguientes representan categorías formales de reglas de negocio explicadas en el curso? (Seleccione todas las que correspondan)',
        options: [
            { id: 'a', text: 'Reglas de Validación (ej. impedir registrar operaciones con fechas futuras).' },
            { id: 'b', text: 'Reglas de Autorización (ej. montos superiores a X requieren aprobación de un segundo perfil).' },
            { id: 'c', text: 'Reglas de Derivación (ej. devolver solicitud observada al originador con motivo obligatorio).' },
            { id: 'd', text: 'Reglas de Vigencia (ej. aplicar tarifas solo a partir de una fecha determinada).' },
            { id: 'e', text: 'Reglas de Configuración de Switch y Enrutamiento IP.' }
        ],
        correct: ['a', 'b', 'c', 'd'],
        explanation: 'Módulo 5: Validación, Autorización, Derivación y Vigencia son reglas de negocio. Enrutamiento IP es conectividad de red.',
        points: 5
    },
    {
        id: 18,
        type: 'multi',
        title: 'Estructura mínima de un buen requerimiento',
        module: 'Módulo 4 y 17: Checklist y plantilla práctica',
        question: '¿Cuáles de los siguientes elementos forman parte de la ESTRUCTURA MÍNIMA recomendada para un buen requerimiento funcional? (Seleccione todas las que correspondan)',
        options: [
            { id: 'a', text: 'Objetivo y Alcance claro (incluyendo expresamente lo que NO incluye).' },
            { id: 'b', text: 'Precondiciones (lo que debe cumplirse antes de iniciar el proceso).' },
            { id: 'c', text: 'Flujo principal con pasos numerados y excepciones documentadas.' },
            { id: 'd', text: 'Validaciones, mensajes al usuario y reglas de negocio sin supuestos.' },
            { id: 'e', text: 'Criterios de aceptación objetivos basados en casos verificables.' }
        ],
        correct: ['a', 'b', 'c', 'd', 'e'],
        explanation: 'Módulo 4: Todos estos componentes son pilares indispensables para que el desarrollador construya la solución correcta.',
        points: 5
    },
    {
        id: 19,
        type: 'multi',
        title: 'Errores críticos y sus riesgos',
        module: 'Módulo 12: Errores frecuentes y su impacto',
        question: '¿Cuáles de las siguientes situaciones corresponden a ERRORES CRÍTICOS y sus verdaderos riesgos según la capacitación? (Seleccione todas las que correspondan)',
        options: [
            { id: 'a', text: 'Describir solo la pantalla visual: provoca que se omitan reglas, estados de negocio y excepciones.' },
            { id: 'b', text: 'Cambiar el alcance verbalmente: ocasiona pérdida de trazabilidad, malentendidos y disputas.' },
            { id: 'c', text: 'Aceptar por apariencia: la pantalla puede lucir atractiva pero contener fallas en el cálculo o almacenamiento.' },
            { id: 'd', text: 'No definir datos históricos o migración: genera que el nuevo sistema no opere con datos previos.' },
            { id: 'e', text: 'Separar la regla general de los ejemplos ilustrativos.' }
        ],
        correct: ['a', 'b', 'c', 'd'],
        explanation: 'Módulo 12: Las opciones a, b, c y d son errores críticos del catálogo. La opción e es una recomendación metodológica correcta.',
        points: 5
    },
    {
        id: 20,
        type: 'multi',
        title: 'Gobernanza, trazabilidad y cierre',
        module: 'Módulos 13, 16 y 19: Trazabilidad y cierre',
        question: 'Para una adecuada GOBERNANZA Y GESTIÓN de los requerimientos a lo largo del ciclo de vida del desarrollo, ¿qué principios deben aplicarse? (Seleccione todas las que correspondan)',
        options: [
            { id: 'a', text: 'Mantener una versión aprobada del requerimiento y formalizar decisiones acordadas en reuniones o correos.' },
            { id: 'b', text: 'Diferenciar con claridad entre una aclaración de alcance y un cambio formal de requerimiento.' },
            { id: 'c', text: 'Recordar que «aceptar es probar»: la conformidad de una entrega se demuestra ejecutando los criterios de aceptación.' },
            { id: 'd', text: 'Recordar que un ejemplo ayuda a ilustrar pero nunca sustituye a la regla general de negocio.' },
            { id: 'e', text: 'Permitir que el proveedor modifique las reglas del negocio libremente sin notificar al equipo funcional.' }
        ],
        correct: ['a', 'b', 'c', 'd'],
        explanation: 'Módulos 13 y 19: Las opciones a, b, c y d aseguran trazabilidad y calidad. La opción e vulnera el control de cambios institucional.',
        points: 5
    }
];

module.exports = {
    questions10,
    questions20
};

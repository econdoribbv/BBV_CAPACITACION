const fs = require('fs');
const path = require('path');
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
    ShadingType,
    PageBreak,
    ImageRun,
    Footer,
    PageNumber,
    NumberFormat
} = require('docx');

// BBV Brand Colors from PALETA_COLORES.md
const COLOR_MORADO = "654388";   // Morado BBV (Primario)
const COLOR_VERDE = "36BC87";    // Verde BBV (Primario)
const COLOR_CELESTE = "59C8E1";  // Celeste BBV
const COLOR_NARANJA = "F7941E";  // Naranja BBV
const COLOR_CARBON = "2B2734";   // Carbón (Texto Principal)
const COLOR_GRIS_TXT = "6B6B76"; // Gris Texto Secundario
const COLOR_BG_LIGHT = "F4F4F6"; // Fondo gris claro
const COLOR_BG_VERDE = "EBF7F2"; // Fondo verde muy claro
const COLOR_BORDER = "C9C9D1";   // Gris bordes
const COLOR_BLANCO = "FFFFFF";

const logoBuffer = fs.readFileSync(path.join(__dirname, 'Logo BBV JPG.jpg'));

function createHeaderTable(titleText, subtitleText, versionTag) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 70, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.NONE },
                            bottom: { style: BorderStyle.SINGLE, size: 24, color: COLOR_VERDE },
                            left: { style: BorderStyle.NONE },
                            right: { style: BorderStyle.NONE }
                        },
                        margins: { top: 120, bottom: 180, left: 100, right: 100 },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "BOLSA BOLIVIANA DE VALORES S.A.",
                                        bold: true,
                                        size: 19,
                                        color: COLOR_MORADO,
                                        font: "Arial"
                                    })
                                ]
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "Gerencia de Tecnología de Información (GTI) — Control de Calidad y Procesos",
                                        size: 16,
                                        color: COLOR_GRIS_TXT,
                                        font: "Arial"
                                    })
                                ],
                                spacing: { after: 100 }
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: titleText,
                                        bold: true,
                                        size: 26,
                                        color: COLOR_MORADO,
                                        font: "Arial"
                                    })
                                ]
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: subtitleText,
                                        italics: true,
                                        size: 18,
                                        color: COLOR_CARBON,
                                        font: "Arial"
                                    })
                                ],
                                spacing: { after: 80 }
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `[ ${versionTag} ]`,
                                        bold: true,
                                        size: 17,
                                        color: COLOR_VERDE,
                                        font: "Arial"
                                    })
                                ]
                            })
                        ]
                    }),
                    new TableCell({
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.NONE },
                            bottom: { style: BorderStyle.SINGLE, size: 24, color: COLOR_VERDE },
                            left: { style: BorderStyle.NONE },
                            right: { style: BorderStyle.NONE }
                        },
                        margins: { top: 120, bottom: 180, left: 100, right: 100 },
                        verticalAlign: "center",
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [
                                    new ImageRun({
                                        data: logoBuffer,
                                        transformation: { width: 155, height: 64 }
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
}

function createStudentInfoTable() {
    const cellBorder = { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER };
    const headerBorder = { style: BorderStyle.SINGLE, size: 6, color: COLOR_MORADO };

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        columnSpan: 4,
                        shading: { type: ShadingType.CLEAR, fill: COLOR_MORADO },
                        borders: { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder },
                        margins: { top: 80, bottom: 80, left: 140, right: 140 },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "DATOS DEL PARTICIPANTE Y REGISTRO DE CAPACITACIÓN",
                                        bold: true,
                                        size: 18,
                                        color: COLOR_BLANCO,
                                        font: "Arial"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 28, type: WidthType.PERCENTAGE },
                        shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
                        borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "Nombre y Apellidos:", bold: true, size: 17, color: COLOR_CARBON, font: "Arial" })
                                ]
                            })
                        ]
                    }),
                    new TableCell({
                        width: { size: 72, type: WidthType.PERCENTAGE },
                        columnSpan: 3,
                        borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "____________________________________________________________________", color: COLOR_BORDER, size: 17, font: "Arial" })
                                ]
                            })
                        ]
                    })
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 28, type: WidthType.PERCENTAGE },
                        shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
                        borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "Área / Unidad / Cargo:", bold: true, size: 17, color: COLOR_CARBON, font: "Arial" })
                                ]
                            })
                        ]
                    }),
                    new TableCell({
                        width: { size: 72, type: WidthType.PERCENTAGE },
                        columnSpan: 3,
                        borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "____________________________________________________________________", color: COLOR_BORDER, size: 17, font: "Arial" })
                                ]
                            })
                        ]
                    })
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 28, type: WidthType.PERCENTAGE },
                        shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
                        borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "Fecha de Evaluación:", bold: true, size: 17, color: COLOR_CARBON, font: "Arial" })
                                ]
                            })
                        ]
                    }),
                    new TableCell({
                        width: { size: 27, type: WidthType.PERCENTAGE },
                        borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "_____ / _____ / 2026", size: 17, color: COLOR_CARBON, font: "Arial" })
                                ]
                            })
                        ]
                    }),
                    new TableCell({
                        width: { size: 25, type: WidthType.PERCENTAGE },
                        shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
                        borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "Fecha y Hora Capacitación:", bold: true, size: 17, color: COLOR_CARBON, font: "Arial" })
                                ]
                            })
                        ]
                    }),
                    new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "___/___/2026  Hora: __:__", size: 16, color: COLOR_CARBON, font: "Arial" })
                                ]
                            })
                        ]
                    })
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 28, type: WidthType.PERCENTAGE },
                        shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
                        borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "Instructor / Facilitador:", bold: true, size: 17, color: COLOR_CARBON, font: "Arial" })
                                ]
                            })
                        ]
                    }),
                    new TableCell({
                        width: { size: 27, type: WidthType.PERCENTAGE },
                        borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "GTI — Equipo de Desarrollo", size: 17, color: COLOR_CARBON, font: "Arial" })
                                ]
                            })
                        ]
                    }),
                    new TableCell({
                        width: { size: 25, type: WidthType.PERCENTAGE },
                        shading: { type: ShadingType.CLEAR, fill: COLOR_BG_VERDE },
                        borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "Puntaje Obtenido:", bold: true, size: 17, color: COLOR_MORADO, font: "Arial" })
                                ]
                            })
                        ]
                    }),
                    new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        shading: { type: ShadingType.CLEAR, fill: COLOR_BG_VERDE },
                        borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: "______ / 100 pts", bold: true, size: 18, color: COLOR_MORADO, font: "Arial" })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
}

function createInstructionsBox(timeMinutes, totalQuestions, fillCount, singleCount, multiCount) {
    const leftBorder = { style: BorderStyle.SINGLE, size: 36, color: COLOR_VERDE };
    const thinBorder = { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER };

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        margins: { top: 120, bottom: 120, left: 160, right: 160 },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
                        borders: { top: thinBorder, bottom: thinBorder, left: leftBorder, right: thinBorder },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "📌 INSTRUCCIONES GENERALES DE LA EVALUACIÓN",
                                        bold: true,
                                        size: 19,
                                        color: COLOR_MORADO,
                                        font: "Arial"
                                    })
                                ],
                                spacing: { after: 80 }
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "1. Objetivo: ", bold: true, size: 17, color: COLOR_CARBON, font: "Arial" }),
                                    new TextRun({
                                        text: "Evaluar la asimilación de los conceptos, roles, estándares y buenas prácticas para la redacción de requerimientos funcionales hacia el equipo de desarrollo/proveedor.",
                                        size: 17,
                                        color: COLOR_CARBON,
                                        font: "Arial"
                                    })
                                ],
                                spacing: { after: 50 }
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "2. Estructura de la prueba: ", bold: true, size: 17, color: COLOR_CARBON, font: "Arial" }),
                                    new TextRun({
                                        text: `Consta de ${totalQuestions} preguntas divididas en: ${fillCount} preguntas de completar párrafos clave (20%), ${singleCount} preguntas de selección múltiple con única opción, y ${multiCount} preguntas de selección múltiple con más de una opción correcta.`,
                                        size: 17,
                                        color: COLOR_CARBON,
                                        font: "Arial"
                                    })
                                ],
                                spacing: { after: 50 }
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "3. Forma de respuesta: ", bold: true, size: 17, color: COLOR_CARBON, font: "Arial" }),
                                    new TextRun({
                                        text: "En selección múltiple de única opción, marque una sola casilla con una [ X ]. En preguntas de selección múltiple con más de una opción, marque todas las casillas aplicables. En preguntas de completar, rellene los espacios en blanco con las palabras técnicas adecuadas del banco provisto.",
                                        size: 17,
                                        color: COLOR_CARBON,
                                        font: "Arial"
                                    })
                                ],
                                spacing: { after: 50 }
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `4. Tiempo disponible: `, bold: true, size: 17, color: COLOR_CARBON, font: "Arial" }),
                                    new TextRun({ text: `${timeMinutes} minutos. `, size: 17, color: COLOR_CARBON, font: "Arial" }),
                                    new TextRun({ text: "Puntaje mínimo de aprobación: ", bold: true, size: 17, color: COLOR_CARBON, font: "Arial" }),
                                    new TextRun({ text: "70 / 100 puntos.", bold: true, size: 17, color: COLOR_MORADO, font: "Arial" })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
}

function createSectionBanner(sectionTitle, sectionSubtitle) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        shading: { type: ShadingType.CLEAR, fill: COLOR_MORADO },
                        borders: {
                            top: { style: BorderStyle.NONE },
                            bottom: { style: BorderStyle.SINGLE, size: 18, color: COLOR_VERDE },
                            left: { style: BorderStyle.NONE },
                            right: { style: BorderStyle.NONE }
                        },
                        margins: { top: 100, bottom: 100, left: 140, right: 140 },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: sectionTitle,
                                        bold: true,
                                        size: 20,
                                        color: COLOR_BLANCO,
                                        font: "Arial"
                                    })
                                ]
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: sectionSubtitle,
                                        italics: true,
                                        size: 16,
                                        color: "DED8E8",
                                        font: "Arial"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
}

function createFillQuestionParagraphs(num, points, title, paragraphTemplate, wordBank, linesToAnswer = 3) {
    const paragraphs = [];

    paragraphs.push(new Paragraph({
        children: [
            new TextRun({ text: `Pregunta ${num} `, bold: true, size: 19, color: COLOR_MORADO, font: "Arial" }),
            new TextRun({ text: `(${points} puntos) — `, bold: true, size: 17, color: COLOR_VERDE, font: "Arial" }),
            new TextRun({ text: "[COMPLETAR PÁRRAFO CLAVE]", bold: true, size: 17, color: COLOR_NARANJA, font: "Arial" })
        ],
        spacing: { before: 200, after: 60 }
    }));

    paragraphs.push(new Paragraph({
        children: [
            new TextRun({ text: title, bold: true, size: 18, color: COLOR_CARBON, font: "Arial" })
        ],
        spacing: { after: 100 }
    }));

    // Text box for the paragraph with blanks
    paragraphs.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
                        borders: {
                            left: { style: BorderStyle.SINGLE, size: 18, color: COLOR_MORADO },
                            top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
                            right: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
                            bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER }
                        },
                        margins: { top: 100, bottom: 100, left: 140, right: 140 },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: paragraphTemplate,
                                        italics: true,
                                        size: 18,
                                        color: COLOR_CARBON,
                                        font: "Arial"
                                    })
                                ],
                                spacing: { after: 80 }
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "📦 Banco de términos sugeridos (incluye distractores): ", bold: true, size: 16, color: COLOR_MORADO, font: "Arial" }),
                                    new TextRun({ text: `[ ${wordBank.join('  |  ')} ]`, bold: true, size: 16, color: COLOR_CARBON, font: "Arial" })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    }));

    paragraphs.push(new Paragraph({
        children: [
            new TextRun({ text: "Escriba en orden los términos correspondientes para cada espacio:", bold: true, size: 16, color: COLOR_GRIS_TXT, font: "Arial" })
        ],
        spacing: { before: 80, after: 60 }
    }));

    for (let i = 1; i <= linesToAnswer; i++) {
        paragraphs.push(new Paragraph({
            children: [
                new TextRun({ text: `Espacio (${i}): `, bold: true, size: 17, color: COLOR_CARBON, font: "Arial" }),
                new TextRun({ text: "____________________________________________________________________________", color: COLOR_BORDER, size: 17, font: "Arial" })
            ],
            spacing: { after: 40 }
        }));
    }

    return paragraphs;
}

function createSingleChoiceParagraphs(num, points, questionText, contextNote, options) {
    const paragraphs = [];

    paragraphs.push(new Paragraph({
        children: [
            new TextRun({ text: `Pregunta ${num} `, bold: true, size: 19, color: COLOR_MORADO, font: "Arial" }),
            new TextRun({ text: `(${points} puntos) — `, bold: true, size: 17, color: COLOR_VERDE, font: "Arial" }),
            new TextRun({ text: "[SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN]", bold: true, size: 16, color: COLOR_MORADO, font: "Arial" }),
            new TextRun({ text: " (Marque solo una casilla con una X)", italics: true, size: 15, color: COLOR_GRIS_TXT, font: "Arial" })
        ],
        spacing: { before: 200, after: 60 }
    }));

    paragraphs.push(new Paragraph({
        children: [
            new TextRun({ text: questionText, bold: true, size: 18, color: COLOR_CARBON, font: "Arial" })
        ],
        spacing: { after: contextNote ? 40 : 80 }
    }));

    if (contextNote) {
        paragraphs.push(new Paragraph({
            children: [
                new TextRun({ text: `Contexto / Caso: "${contextNote}"`, italics: true, size: 17, color: COLOR_GRIS_TXT, font: "Arial" })
            ],
            spacing: { after: 80 }
        }));
    }

    // Options
    options.forEach(opt => {
        paragraphs.push(new Paragraph({
            children: [
                new TextRun({ text: `   [   ]  ${opt.letter}) `, bold: true, size: 18, color: COLOR_MORADO, font: "Arial" }),
                new TextRun({ text: opt.text, size: 17, color: COLOR_CARBON, font: "Arial" })
            ],
            spacing: { after: 40 }
        }));
    });

    return paragraphs;
}

function createMultiChoiceParagraphs(num, points, questionText, contextNote, options) {
    const paragraphs = [];

    paragraphs.push(new Paragraph({
        children: [
            new TextRun({ text: `Pregunta ${num} `, bold: true, size: 19, color: COLOR_MORADO, font: "Arial" }),
            new TextRun({ text: `(${points} puntos) — `, bold: true, size: 17, color: COLOR_VERDE, font: "Arial" }),
            new TextRun({ text: "[SELECCIÓN MÚLTIPLE — MÁS DE UNA OPCIÓN CORRECTA]", bold: true, size: 16, color: COLOR_CELESTE, font: "Arial" }),
            new TextRun({ text: " (⚠️ Marque TODAS las que considere correctas)", bold: true, italics: true, size: 15, color: COLOR_NARANJA, font: "Arial" })
        ],
        spacing: { before: 200, after: 60 }
    }));

    paragraphs.push(new Paragraph({
        children: [
            new TextRun({ text: questionText, bold: true, size: 18, color: COLOR_CARBON, font: "Arial" })
        ],
        spacing: { after: contextNote ? 40 : 80 }
    }));

    if (contextNote) {
        paragraphs.push(new Paragraph({
            children: [
                new TextRun({ text: `Contexto / Caso: "${contextNote}"`, italics: true, size: 17, color: COLOR_GRIS_TXT, font: "Arial" })
            ],
            spacing: { after: 80 }
        }));
    }

    // Options
    options.forEach(opt => {
        paragraphs.push(new Paragraph({
            children: [
                new TextRun({ text: `   [   ]  ${opt.letter}) `, bold: true, size: 18, color: COLOR_CELESTE, font: "Arial" }),
                new TextRun({ text: opt.text, size: 17, color: COLOR_CARBON, font: "Arial" })
            ],
            spacing: { after: 40 }
        }));
    });

    return paragraphs;
}

function createAnswerKeySection(answers, totalPoints, versionTag) {
    const paragraphs = [];

    // Page Break before Answer Key
    paragraphs.push(new Paragraph({ children: [new PageBreak()] }));

    // Solucionario Header Table
    paragraphs.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        shading: { type: ShadingType.CLEAR, fill: COLOR_MORADO },
                        borders: {
                            top: { style: BorderStyle.NONE },
                            bottom: { style: BorderStyle.SINGLE, size: 24, color: COLOR_VERDE },
                            left: { style: BorderStyle.NONE },
                            right: { style: BorderStyle.NONE }
                        },
                        margins: { top: 120, bottom: 120, left: 140, right: 140 },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: "PAUTA OFICIAL DE CORRECCIÓN Y SOLUCIONARIO TÉCNICO",
                                        bold: true,
                                        size: 22,
                                        color: COLOR_BLANCO,
                                        font: "Arial"
                                    })
                                ]
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: `USO EXCLUSIVO DEL FACILITADOR / EVALUADOR — ${versionTag}`,
                                        bold: true,
                                        size: 16,
                                        color: COLOR_VERDE,
                                        font: "Arial"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    }));

    paragraphs.push(new Paragraph({
        children: [
            new TextRun({
                text: "Esta pauta detalla la respuesta correcta, la justificación técnica y la referencia exacta al documento oficial de capacitación ('Capacitacion_Elaboracion_de_Requerimientos_Funcionales.docx') para garantizar una calificación objetiva.",
                italics: true,
                size: 17,
                color: COLOR_GRIS_TXT,
                font: "Arial"
            })
        ],
        spacing: { before: 100, after: 140 }
    }));

    answers.forEach(ans => {
        const borderLeftColor = ans.type.includes('COMPLETAR') ? COLOR_NARANJA : (ans.type.includes('MÁS DE UNA') ? COLOR_CELESTE : COLOR_VERDE);

        paragraphs.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
                            borders: {
                                left: { style: BorderStyle.SINGLE, size: 24, color: borderLeftColor },
                                top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
                                right: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
                                bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER }
                            },
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: `Pregunta ${ans.num}: `, bold: true, size: 18, color: COLOR_MORADO, font: "Arial" }),
                                        new TextRun({ text: `[${ans.type}] — `, bold: true, size: 16, color: borderLeftColor, font: "Arial" }),
                                        new TextRun({ text: `Valor: ${ans.points} pts`, bold: true, size: 16, color: COLOR_CARBON, font: "Arial" })
                                    ],
                                    spacing: { after: 40 }
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: "✔ Respuesta Correcta: ", bold: true, size: 17, color: COLOR_MORADO, font: "Arial" }),
                                        new TextRun({ text: ans.correctAnswer, bold: true, size: 17, color: COLOR_VERDE, font: "Arial" })
                                    ],
                                    spacing: { after: 40 }
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: "📖 Fuente en el Documento: ", bold: true, size: 16, color: COLOR_CARBON, font: "Arial" }),
                                        new TextRun({ text: ans.sourceReference, size: 16, color: COLOR_CARBON, font: "Arial" })
                                    ],
                                    spacing: { after: 40 }
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: "💡 Justificación Técnica: ", bold: true, size: 16, color: COLOR_CARBON, font: "Arial" }),
                                        new TextRun({ text: ans.rationale, size: 16, color: COLOR_CARBON, font: "Arial" })
                                    ],
                                    spacing: { after: 40 }
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: "⚖ Criterio de Puntuación: ", bold: true, size: 15, color: COLOR_GRIS_TXT, font: "Arial" }),
                                        new TextRun({ text: ans.rubric, italics: true, size: 15, color: COLOR_GRIS_TXT, font: "Arial" })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        }));

        paragraphs.push(new Paragraph({ text: "", spacing: { after: 80 } }));
    });

    return paragraphs;
}

// -------------------------------------------------------------
// DEFINITION OF QUESTIONS FOR VERSION 1 (10 QUESTIONS)
// -------------------------------------------------------------
const v1Questions = {
    fill: [
        {
            num: 1,
            points: 10,
            title: "Regla de Oro en la especificación de requerimientos (Módulo 4)",
            template: "« Si una condición puede cambiar el _______________ (1) del proceso, debe quedar _______________ (2). Si un dato es necesario para decidir, calcular, aprobar, rechazar o reportar, debe quedar _______________ (3). »",
            wordBank: ["escrita", "resultado", "definido", "código", "estimado", "borrador"],
            lines: 3
        },
        {
            num: 2,
            points: 10,
            title: "Traducción de conocimiento y roles funcionales (Módulo 19 - Cierre)",
            template: "« El proveedor debe convertir _______________ (1) en software; el equipo funcional debe convertir _______________ (2) en requerimientos. La calidad del _______________ (3) depende de la calidad de esa traducción. »",
            wordBank: ["requerimientos", "conocimiento del negocio", "resultado", "presupuesto", "pantallas", "algoritmos"],
            lines: 3
        }
    ],
    single: [
        {
            num: 3,
            points: 10,
            question: "¿Cuál es el propósito primordial de un requerimiento funcional desde la perspectiva del equipo de negocio?",
            context: "Enfoque conceptual del Módulo 1 y Módulo 2",
            options: [
                { letter: "a", text: "Explicar al desarrollador qué tablas de base de datos, lenguajes y librerías técnicas debe utilizar." },
                { letter: "b", text: "Describir qué necesita el negocio, bajo qué reglas debe operar la solución y cómo sabremos que el resultado es correcto." },
                { letter: "c", text: "Diseñar la arquitectura técnica de servidores, puertos y protocolos de comunicación de la infraestructura." },
                { letter: "d", text: "Presentar una propuesta de diseño gráfico visual sin detallar excepciones ni validaciones de fondo." }
            ]
        },
        {
            num: 4,
            points: 10,
            question: "En las instituciones existen reglas que se consideran «obvias» porque el equipo las aplica a diario. Según la capacitación, ¿qué sucede si estas reglas NO se documentan?",
            context: "El problema de los supuestos (Módulo 1)",
            options: [
                { letter: "a", text: "El desarrollador siempre las deducirá de manera intuitiva y correcta al escribir el código." },
                { letter: "b", text: "Existen tres posibilidades: el proveedor pregunta, interpreta o no las implementa; las dos últimas generan retrabajo y riesgo." },
                { letter: "c", text: "El sistema operará sin fallas porque las políticas institucionales son de conocimiento público." },
                { letter: "d", text: "Se reduce el tiempo de desarrollo al no sobrecargar el requerimiento con reglas cotidianas." }
            ]
        },
        {
            num: 5,
            points: 10,
            question: "La capacitación distingue cuatro niveles de maduración. Si un analista redacta: «Dado un monto de 0, al presionar Guardar, la operación no se registra y se muestra el mensaje 'El monto debe ser mayor a cero'», ¿a qué nivel corresponde?",
            context: "De la necesidad al requerimiento (Módulo 3)",
            options: [
                { letter: "a", text: "Necesidad de negocio (problema u oportunidad)." },
                { letter: "b", text: "Objetivo general de la solución." },
                { letter: "c", text: "Requerimiento no funcional de rendimiento." },
                { letter: "d", text: "Criterio de aceptación observable y verificable." }
            ]
        },
        {
            num: 6,
            points: 10,
            question: "Al especificar una validación dentro del requerimiento, ¿cuál es la estructura completa exigida para que sea verdaderamente verificable?",
            context: "Validaciones, mensajes y comportamiento ante errores (Módulo 8)",
            options: [
                { letter: "a", text: "Indicar únicamente la frase general «validar los datos antes de continuar» y confiar en la experiencia del desarrollador." },
                { letter: "b", text: "Definir la condición que se controla, la acción concreta del sistema (bloquear o advertir) y el mensaje visible exacto para el usuario." },
                { letter: "c", text: "Especificar únicamente el nombre del campo en la base de datos sin redactar mensajes de advertencia." },
                { letter: "d", text: "Adjuntar una imagen de error de otro sistema sin definir el texto ni la lógica esperada." }
            ]
        },
        {
            num: 7,
            points: 10,
            question: "¿Cuál de las siguientes situaciones califica estrictamente como un CAMBIO DE ALCANCE y no como una simple aclaración?",
            context: "Trazabilidad y gestión de cambios (Módulo 13)",
            options: [
                { letter: "a", text: "Precisar el formato visual de una fecha (DD/MM/AAAA) que ya estaba contemplada en el alcance aprobado." },
                { letter: "b", text: "Explicar el significado operativo de una sigla de negocio incluida previamente en el flujo principal." },
                { letter: "c", text: "Incorporar una nueva regla que exige la aprobación de un segundo perfil cuando el monto supere los 50.000 BOB." },
                { letter: "d", text: "Indicar que el botón 'Cancelar' debe retornar al usuario a la pantalla de búsqueda previamente definida." }
            ]
        }
    ],
    multi: [
        {
            num: 8,
            points: 10,
            question: "¿Cuáles de las siguientes palabras o expresiones son consideradas «peligrosas» al redactar requerimientos porque parecen claras pero esconden ambigüedad y falta de definición?",
            context: "Palabras peligrosas (Módulo 11)",
            options: [
                { letter: "a", text: "«Automáticamente» (no aclara qué evento lo dispara, en qué momento ni qué ocurre si el proceso falla)." },
                { letter: "b", text: "«Según corresponda» (no define cuáles son exactamente las condiciones ni las alternativas aplicables)." },
                { letter: "c", text: "«La fecha de vencimiento debe ser estrictamente posterior a la fecha de emisión» (es una regla precisa)." },
                { letter: "d", text: "«Rápido» (no define un tiempo objetivo de respuesta ni condiciones de concurrencia o carga)." },
                { letter: "e", text: "«Información necesaria» (no especifica la lista exhaustiva de campos obligatorios requeridos)." }
            ]
        },
        {
            num: 9,
            points: 10,
            question: "Las reglas de negocio reflejan políticas y decisiones operativas. Según la capacitación, ¿cuáles de las siguientes opciones corresponden a tipos formales de reglas de negocio?",
            context: "Tipos comunes de reglas de negocio (Módulo 5)",
            options: [
                { letter: "a", text: "Reglas de Validación (ej. «No se puede registrar una fecha futura»)." },
                { letter: "b", text: "Reglas de Cálculo (ej. «Comisión = monto × porcentaje según tarifario con redondeo a 2 decimales»)." },
                { letter: "c", text: "Reglas de Autorización (ej. «Montos superiores a X requieren aprobación de un segundo perfil»)." },
                { letter: "d", text: "Reglas de Derivación (ej. «Si la operación es rechazada, retornar al usuario originador con motivo obligatorio»)." },
                { letter: "e", text: "Reglas de Cableado Estructurado y Fibra Óptica (corresponden a infraestructura física, no a negocio)." }
            ]
        },
        {
            num: 10,
            points: 10,
            question: "¿Cuáles de las siguientes prácticas constituyen ERRORES FRECUENTES identificados en el levantamiento de requerimientos funcionales que generan riesgos graves de retrabajo?",
            context: "Errores frecuentes y su impacto (Módulo 12)",
            options: [
                { letter: "a", text: "Describir únicamente la pantalla visual, omitiendo las reglas de negocio, estados de transición y excepciones." },
                { letter: "b", text: "Suponer que el proveedor «ya sabe» cómo funciona el negocio institucional." },
                { letter: "c", text: "Cambiar el alcance verbalmente en reuniones o llamadas sin formalizar ni actualizar el documento de requerimiento." },
                { letter: "d", text: "Aceptar una entrega de desarrollo por simple apariencia estética («se ve bien») sin comprobar la lógica interna con casos de prueba." },
                { letter: "e", text: "Aplicar la técnica de «lectura de tercero» antes de enviar el documento para verificar que no falte información clave." }
            ]
        }
    ],
    answers: [
        {
            num: 1,
            type: "COMPLETAR PÁRRAFO CLAVE (20%)",
            points: 10,
            correctAnswer: "Espacio (1): resultado  |  Espacio (2): escrita  |  Espacio (3): definido",
            sourceReference: "Módulo 4: 'Estructura mínima de un buen requerimiento' — Sección 'Regla de Oro' (pág. 3).",
            rationale: "La regla de oro exige que todo factor determinante para el resultado del proceso esté expresado por escrito y que todo dato indispensable para decidir, calcular, aprobar o reportar quede formalmente definido.",
            rubric: "10 pts si completa los 3 términos correctos; 6 pts por 2 términos correctos; 3 pts por 1 término correcto."
        },
        {
            num: 2,
            type: "COMPLETAR PÁRRAFO CLAVE (20%)",
            points: 10,
            correctAnswer: "Espacio (1): requerimientos  |  Espacio (2): conocimiento del negocio  |  Espacio (3): resultado",
            sourceReference: "Módulo 19: 'Mensajes de cierre' — Sección 'Frase Final' (pág. 11).",
            rationale: "Sintetiza la misión del equipo funcional: el desarrollador convierte especificaciones en software, pero el éxito radica en la calidad con que el negocio convierte su experiencia operativa en requerimientos precisos.",
            rubric: "10 pts si completa los 3 términos correctos; 6 pts por 2 términos correctos; 3 pts por 1 término correcto."
        },
        {
            num: 3,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 10,
            correctAnswer: "Opción b) Describir qué necesita el negocio, bajo qué reglas debe operar la solución y cómo sabremos que el resultado es correcto.",
            sourceReference: "Módulo 1: '¿Qué es un requerimiento?' y Módulo 2: 'Roles: quién sabe qué'.",
            rationale: "El equipo funcional no programa ni diseña infraestructura técnica (opciones a y c); su rol es definir el 'qué', las reglas y la verificación objetiva.",
            rubric: "10 pts si marca b; 0 pts si marca otra opción."
        },
        {
            num: 4,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 10,
            correctAnswer: "Opción b) Existen tres posibilidades: el proveedor pregunta, interpreta o no las implementa; las dos últimas generan retrabajo y riesgo.",
            sourceReference: "Módulo 1: 'El problema de los supuestos'.",
            rationale: "El proveedor externo no conoce lo que el negocio da por 'obvio'. La falta de documentación genera interpretaciones erróneas y omisiones en el software.",
            rubric: "10 pts si marca b; 0 pts si marca otra opción."
        },
        {
            num: 5,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 10,
            correctAnswer: "Opción d) Criterio de aceptación observable y verificable.",
            sourceReference: "Módulo 3: 'De la necesidad al requerimiento' (Tabla comparativa de 4 niveles).",
            rationale: "Un criterio de aceptación describe una condición observable ante una acción específica (formato Dado/Cuando/Entonces) para verificar que el requerimiento se cumple.",
            rubric: "10 pts si marca d; 0 pts si marca otra opción."
        },
        {
            num: 6,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 10,
            correctAnswer: "Opción b) Definir la condición que se controla, la acción concreta del sistema (bloquear o advertir) y el mensaje visible exacto para el usuario.",
            sourceReference: "Módulo 8: 'Validaciones, mensajes y comportamiento ante errores'.",
            rationale: "Una validación verificable requiere la terna: Condición + Acción del sistema + Mensaje visible al usuario.",
            rubric: "10 pts si marca b; 0 pts si marca otra opción."
        },
        {
            num: 7,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 10,
            correctAnswer: "Opción c) Incorporar una nueva regla que exige la aprobación de un segundo perfil cuando el monto supere los 50.000 BOB.",
            sourceReference: "Módulo 13: 'Trazabilidad y gestión de cambios' (Aclaración vs. Cambio).",
            rationale: "Una aclaración precisa algo ya contenido en el alcance original; agregar una nueva regla de negocio con un segundo perfil aprobador altera la lógica y el esfuerzo, constituyendo un cambio formal de alcance.",
            rubric: "10 pts si marca c; 0 pts si marca otra opción."
        },
        {
            num: 8,
            type: "SELECCIÓN MÚLTIPLE — MÁS DE UNA OPCIÓN CORRECTA",
            points: 10,
            correctAnswer: "Opciones a, b, d y e (Todas excepto la c).",
            sourceReference: "Módulo 11: 'Palabras peligrosas: parecen claras, pero no lo son'.",
            rationale: "La opción c es una regla precisa y verificable. Las expresiones 'automáticamente', 'según corresponda', 'rápido' e 'información necesaria' son explícitamente catalogadas como peligrosas por esconder indefiniciones.",
            rubric: "10 pts si marca a, b, d y e sin marcar c; 7.5 pts si marca 3 correctas; 5 pts si marca 2 correctas; 0 pts si marca la opción errónea c."
        },
        {
            num: 9,
            type: "SELECCIÓN MÚLTIPLE — MÁS DE UNA OPCIÓN CORRECTA",
            points: 10,
            correctAnswer: "Opciones a, b, c y d (Todas excepto la e).",
            sourceReference: "Módulo 5: 'Reglas de negocio: el conocimiento que el proveedor no puede adivinar'.",
            rationale: "El manual categoriza las reglas de negocio en: Validación, Cálculo, Autorización, Clasificación, Derivación y Vigencia. El cableado estructurado es un aspecto de infraestructura técnica física.",
            rubric: "10 pts si marca a, b, c y d sin marcar e; 7.5 pts si marca 3 correctas; 5 pts si marca 2 correctas; 0 pts si marca la opción errónea e."
        },
        {
            num: 10,
            type: "SELECCIÓN MÚLTIPLE — MÁS DE UNA OPCIÓN CORRECTA",
            points: 10,
            correctAnswer: "Opciones a, b, c y d (Todas excepto la e).",
            sourceReference: "Módulo 12: 'Errores frecuentes y su impacto' y Módulo 14.",
            rationale: "Describir solo pantallas, asumir que el proveedor ya sabe, cambiar alcance verbalmente y aceptar por apariencia son los 4 grandes errores listados. La opción e ('lectura de tercero') es una buena práctica recomendada.",
            rubric: "10 pts si marca a, b, c y d sin marcar e; 7.5 pts si marca 3 correctas; 5 pts si marca 2 correctas; 0 pts si marca la opción errónea e."
        }
    ]
};

// -------------------------------------------------------------
// DEFINITION OF QUESTIONS FOR VERSION 2 (20 QUESTIONS)
// -------------------------------------------------------------
const v2Questions = {
    fill: [
        {
            num: 1,
            points: 5,
            title: "Idea Clave: Negocio vs. Proveedor y la Omisión en el Sistema (Módulo 1)",
            template: "« El proveedor conoce _______________ (1) y tecnología. El equipo funcional conoce el _______________ (2). Si las reglas del negocio, excepciones, datos y criterios esperados no están _______________ (3), el desarrollador no tiene una base objetiva para incorporarlos. Una omisión en el requerimiento suele convertirse en una _______________ (4) en el sistema. »",
            wordBank: ["escritos", "negocio", "omisión", "programación", "infraestructura", "sugerencia"],
            lines: 4
        },
        {
            num: 2,
            points: 5,
            title: "Regla de Oro de la Especificación Funcional (Módulo 4)",
            template: "« Si una condición puede cambiar el _______________ (1) del proceso, debe quedar _______________ (2). Si un dato es necesario para decidir, calcular, aprobar, rechazar o reportar, debe quedar _______________ (3). »",
            wordBank: ["escrita", "resultado", "definido", "flexible", "estimado", "programado"],
            lines: 3
        },
        {
            num: 3,
            points: 5,
            title: "Precisión de Requerimientos y el Rol de los Ejemplos (Módulo 19 - Cierre)",
            template: "« Más detalle no significa más texto. Significa _______________ (1): condiciones, datos, excepciones y resultados verificables. Un ejemplo ayuda, pero no _______________ (2) una regla. Primero se escribe la regla _______________ (3); luego se agregan ejemplos. »",
            wordBank: ["reemplaza", "precisión", "general", "excepción", "complejidad", "elimina"],
            lines: 3
        },
        {
            num: 4,
            points: 5,
            title: "El Requerimiento como Contrato de Entendimiento (Módulo 19 - Cierre)",
            template: "« El requerimiento es un _______________ (1) de entendimiento. Su función principal es reducir _______________ (2) diferentes entre negocio y desarrollo. Lo que no se especifica no puede _______________ (3) objetivamente. »",
            wordBank: ["contrato", "interpretaciones", "exigirse", "sugerirse", "trámite", "reuniones"],
            lines: 3
        }
    ],
    single: [
        {
            num: 5,
            points: 5,
            question: "Desde la óptica funcional en la institución, ¿qué busca primordialmente un buen requerimiento?",
            context: "Concepto básico del Módulo 1",
            options: [
                { letter: "a", text: "Especificar el código fuente, la sintaxis SQL y las librerías técnicas que el programador debe compilar." },
                { letter: "b", text: "Explicar qué necesita el negocio, bajo qué reglas debe operar y cómo sabremos objetivamente que el resultado es correcto." },
                { letter: "c", text: "Diseñar la topología de red y servidores para el centro de datos institucional." },
                { letter: "d", text: "Presentar un boceto gráfico libre para que el proveedor invente las reglas durante la marcha." }
            ]
        },
        {
            num: 6,
            points: 5,
            question: "¿Por qué las reglas operativas consideradas «obvias» representan un riesgo crítico si no quedan escritas?",
            context: "El problema de los supuestos (Módulo 1)",
            options: [
                { letter: "a", text: "Porque el proveedor no conoce el negocio; si no están escritas, pregunta, interpreta o no las implementa (las dos últimas generan retrabajo y fallas)." },
                { letter: "b", text: "Porque la base de datos se satura al no tener reglas implícitas cargadas en memoria." },
                { letter: "c", text: "Porque la normativa legal exige que todo código fuente contenga comentarios de texto plano." },
                { letter: "d", text: "Porque impiden que el sistema funcione en computadoras portátiles." }
            ]
        },
        {
            num: 7,
            points: 5,
            question: "Respecto a la delimitación de responsabilidades entre el Negocio y el Proveedor, ¿cuál premisa es la CORRECTA?",
            context: "Roles: quién sabe qué (Módulo 2)",
            options: [
                { letter: "a", text: "El negocio diseña la solución técnica y el proveedor define las políticas institucionales." },
                { letter: "b", text: "El proveedor es responsable de descubrir las reglas del negocio por ensayo y error." },
                { letter: "c", text: "El éxito aparece cuando el negocio especifica con precisión el «qué» y el proveedor diseña el «cómo»." },
                { letter: "d", text: "Ninguna de las partes debe documentar precondiciones ni excepciones antes de la entrega final." }
            ]
        },
        {
            num: 8,
            points: 5,
            question: "Considere el enunciado: «El sistema debe impedir guardar una operación si el monto es menor o igual a cero». Según los 4 niveles de la capacitación, corresponde a:",
            context: "De la necesidad al requerimiento (Módulo 3)",
            options: [
                { letter: "a", text: "Necesidad de negocio (problema general)." },
                { letter: "b", text: "Objetivo estratégico." },
                { letter: "c", text: "Requerimiento funcional (comportamiento específico del sistema)." },
                { letter: "d", text: "Criterio de aceptación verificable en formato BDD." }
            ]
        },
        {
            num: 9,
            points: 5,
            question: "Un requerimiento funcional señala: «Validar que la fecha sea correcta». ¿Por qué es una redacción DÉBIL y deficiente?",
            context: "Validaciones y mensajes (Módulo 8)",
            options: [
                { letter: "a", text: "Porque no define la condición exacta (ej. posterior a emisión), qué acción toma el sistema (bloquear) ni el mensaje visible al usuario." },
                { letter: "b", text: "Porque las fechas no pueden validarse mediante sistemas informáticos modernos." },
                { letter: "c", text: "Porque el término 'fecha' es una palabra reservada exclusiva de los administradores de red." },
                { letter: "d", text: "Porque las validaciones siempre deben realizarse de forma manual después de guardar." }
            ]
        },
        {
            num: 10,
            points: 5,
            question: "Al especificar una regla de cálculo (ej. tarifas o comisiones), ¿cuál práctica cumple con el estándar enseñado?",
            context: "Reglas de cálculo (Módulo 5)",
            options: [
                { letter: "a", text: "Colocar únicamente «Calcular la comisión correspondiente» para que el desarrollador elija la fórmula matemática." },
                { letter: "b", text: "Detallar la fórmula exacta, la fuente de las tasas vigentes, el criterio de redondeo y el comportamiento si falta una tarifa." },
                { letter: "c", text: "Enviar una captura de pantalla de una calculadora sin redactar la regla en el documento." },
                { letter: "d", text: "Permitir que cada usuario escriba la comisión que considere conveniente en cada transacción." }
            ]
        },
        {
            num: 11,
            points: 5,
            question: "¿Por qué el manual insiste en que no es suficiente documentar el «flujo principal» o camino feliz?",
            context: "Flujos, escenarios y excepciones (Módulo 7)",
            options: [
                { letter: "a", text: "Porque en los sistemas reales, buena parte de los incidentes y errores operativos ocurre precisamente en excepciones y escenarios poco frecuentes." },
                { letter: "b", text: "Porque los flujos principales nunca se ejecutan en los ambientes de producción." },
                { letter: "c", text: "Porque los proveedores de software cobran una tarifa fija sin importar la cantidad de flujos alternos." },
                { letter: "d", text: "Porque los flujos alternos reemplazan totalmente al flujo principal." }
            ]
        },
        {
            num: 12,
            points: 5,
            question: "¿Cuál es la estructura estándar recomendada para redactar criterios de aceptación objetivos y comprobables?",
            context: "Criterios de aceptación (Módulo 9)",
            options: [
                { letter: "a", text: "ANTES [situación] / DURANTE [operación] / DESPUÉS [finalización]." },
                { letter: "b", text: "DADO [condición inicial] / CUANDO [acción del usuario o evento] / ENTONCES [resultado observable del sistema]." },
                { letter: "c", text: "HIPÓTESIS [supuesto] / PRUEBA [ensayo] / CONCLUSIÓN [aprobación]." },
                { letter: "d", text: "QUIÉN [usuario] / DÓNDE [módulo] / POR QUÉ [justificación]." }
            ]
        },
        {
            num: 13,
            points: 5,
            question: "En relación con los Requerimientos No Funcionales (disponibilidad, rendimiento, volumen, continuidad):",
            context: "Requerimientos no funcionales (Módulo 10)",
            options: [
                { letter: "a", text: "El equipo funcional no debe intervenir, ya que son temas 100% de hardware y telecomunicaciones." },
                { letter: "b", text: "El equipo funcional expresa la necesidad operativa del negocio y el impacto; el proveedor propone la métrica técnica que se acuerda mutuamente." },
                { letter: "c", text: "El equipo de negocio debe calcular los milisegundos de CPU y la memoria RAM requerida por el servidor." },
                { letter: "d", text: "Solo se analizan una vez que el sistema ya colapsó en producción." }
            ]
        },
        {
            num: 14,
            points: 5,
            question: "La técnica de revisión previa a remitir el documento denominada «Lectura de tercero» consiste en:",
            context: "Técnica de revisión (Módulo 14)",
            options: [
                { letter: "a", text: "Contratar a tres empresas auditoras externas simultáneamente para cotizar el proyecto." },
                { letter: "b", text: "Revisar el requerimiento como si no se conociera el proceso, detectando dudas que solo están en la cabeza del autor." },
                { letter: "c", text: "Verificar únicamente que el documento tenga más de 50 páginas sin leer las reglas." },
                { letter: "d", text: "Pasar el texto por un traductor de idiomas para verificar su redacción técnica." }
            ]
        }
    ],
    multi: [
        {
            num: 15,
            points: 5,
            question: "Al definir un campo o dato en el requerimiento (ej. en una pantalla de registro), ¿cuáles aspectos deben quedar explícitamente detallados?",
            context: "Datos y campos: no basta con decir registrar información (Módulo 6)",
            options: [
                { letter: "a", text: "Nombre claro y significado inequívoco de lo que representa en el negocio." },
                { letter: "b", text: "Tipo y formato de dato (texto, numérico con decimales, fecha, etc.)." },
                { letter: "c", text: "Obligatoriedad (siempre obligatorio, opcional o condicional según el caso)." },
                { letter: "d", text: "Fuente del dato (escrito por el usuario, catálogo o servicio externo)." },
                { letter: "e", text: "Editabilidad (en qué estados del flujo se puede modificar y por qué perfiles)." }
            ]
        },
        {
            num: 16,
            points: 5,
            question: "¿Cuáles de las siguientes expresiones son identificadas en la capacitación como «palabras peligrosas» que deben sustituirse por condiciones concretas?",
            context: "Palabras peligrosas: parecen claras, pero no lo son (Módulo 11)",
            options: [
                { letter: "a", text: "«Automáticamente» (sin indicar qué evento lo dispara, en qué momento ni qué pasa ante falla)." },
                { letter: "b", text: "«Según corresponda» (sin detallar qué opciones aplican según cada condición)." },
                { letter: "c", text: "«Similar al sistema actual» (sin precisar qué comportamiento se mantiene y cuál debe cambiar)." },
                { letter: "d", text: "«Los usuarios» (sin indicar perfiles, roles ni niveles de autorización)." },
                { letter: "e", text: "«Monto mayor a cero con hasta dos decimales» (es una regla numérica rigurosa y verificable)." }
            ]
        },
        {
            num: 17,
            points: 5,
            question: "¿Cuáles de las siguientes representan categorías formales de reglas de negocio explicadas en el curso?",
            context: "Tipos comunes de reglas de negocio (Módulo 5)",
            options: [
                { letter: "a", text: "Reglas de Validación (ej. impedir registrar operaciones con plazos vencidos)." },
                { letter: "b", text: "Reglas de Autorización (ej. montos superiores a un umbral requieren firma de un segundo usuario)." },
                { letter: "c", text: "Reglas de Derivación (ej. devolver una solicitud observada al usuario originador con motivo)." },
                { letter: "d", text: "Reglas de Vigencia (ej. aplicar tarifas solo a partir de una fecha determinada)." },
                { letter: "e", text: "Reglas de Configuración de Switch y Router (son temas de comunicaciones de red, no de negocio)." }
            ]
        },
        {
            num: 18,
            points: 5,
            question: "¿Cuáles de los siguientes elementos forman parte de la ESTRUCTURA MÍNIMA recomendada para un buen requerimiento funcional?",
            context: "Estructura mínima de un buen requerimiento (Módulo 4 y 17)",
            options: [
                { letter: "a", text: "Objetivo y Alcance claro (incluyendo expresamente lo que NO incluye)." },
                { letter: "b", text: "Precondiciones (lo que debe cumplirse antes de iniciar el proceso)." },
                { letter: "c", text: "Flujo principal de pasos numerados y excepciones documentadas." },
                { letter: "d", text: "Validaciones, mensajes al usuario y reglas de negocio sin supuestos." },
                { letter: "e", text: "Criterios de aceptación objetivos basados en casos verificables." }
            ]
        },
        {
            num: 19,
            points: 5,
            question: "¿Cuáles de las siguientes situaciones corresponden a ERRORES CRÍTICOS y sus verdaderos riesgos según la capacitación?",
            context: "Errores frecuentes y su impacto (Módulo 12)",
            options: [
                { letter: "a", text: "Describir solo la pantalla visual: provoca que se omitan reglas, estados de negocio y excepciones de fondo." },
                { letter: "b", text: "Cambiar el alcance verbalmente: ocasiona pérdida de trazabilidad, malentendidos y disputas de entrega." },
                { letter: "c", text: "Aceptar por apariencia: la pantalla puede lucir bien pero tener cálculos y almacenamiento inconsistentes." },
                { letter: "d", text: "No definir datos históricos/migración: genera que el nuevo módulo no pueda operar con registros pasados." },
                { letter: "e", text: "Separar la regla general de los ejemplos ilustrativos: esto es una buena práctica y no un error." }
            ]
        },
        {
            num: 20,
            points: 5,
            question: "Para una adecuada GOBERNANZA Y GESTIÓN de los requerimientos durante el ciclo de vida del proyecto, ¿qué principios deben aplicarse?",
            context: "Trazabilidad, gobierno y mensajes de cierre (Módulos 13, 16 y 19)",
            options: [
                { letter: "a", text: "Mantener una versión aprobada del documento y formalizar las decisiones relevantes tomadas por correo o reunión." },
                { letter: "b", text: "Diferenciar con claridad entre una aclaración de alcance y un cambio formal que agrega o altera funcionalidades." },
                { letter: "c", text: "Recordar que «aceptar es probar»: la conformidad de una entrega se demuestra con criterios de aceptación ejecutados." },
                { letter: "d", text: "Recordar que un ejemplo ilustrativo ayuda a entender, pero nunca sustituye a la regla general." },
                { letter: "e", text: "Permitir que el proveedor modifique las reglas del negocio por iniciativa propia sin avisar al equipo funcional." }
            ]
        }
    ],
    answers: [
        {
            num: 1,
            type: "COMPLETAR PÁRRAFO CLAVE (20%)",
            points: 5,
            correctAnswer: "Espacio (1): programación  |  Espacio (2): negocio  |  Espacio (3): escritos  |  Espacio (4): omisión",
            sourceReference: "Módulo 1: 'Idea Clave' (pág. 1).",
            rationale: "Establece el fundamento de toda la capacitación: el desarrollador no puede adivinar el negocio. Si no está escrito, la omisión en el documento se convierte en omisión en el sistema.",
            rubric: "5 pts si completa los 4 términos; 3.75 pts por 3; 2.5 pts por 2; 1.25 pts por 1."
        },
        {
            num: 2,
            type: "COMPLETAR PÁRRAFO CLAVE (20%)",
            points: 5,
            correctAnswer: "Espacio (1): resultado  |  Espacio (2): escrita  |  Espacio (3): definido",
            sourceReference: "Módulo 4: 'Regla de Oro' (pág. 3).",
            rationale: "Toda condición que modifique el curso o resultado debe escribirse; todo dato necesario para decidir o reportar debe definirse.",
            rubric: "5 pts si completa los 3 términos; 3.3 pts por 2; 1.6 pts por 1."
        },
        {
            num: 3,
            type: "COMPLETAR PÁRRAFO CLAVE (20%)",
            points: 5,
            correctAnswer: "Espacio (1): precisión  |  Espacio (2): reemplaza  |  Espacio (3): general",
            sourceReference: "Módulo 19: 'Mensajes de cierre' (pág. 11).",
            rationale: "El volumen de texto no sustituye a la precisión. Los ejemplos ilustran, pero la regla general es la que gobierna la implementación técnica.",
            rubric: "5 pts si completa los 3 términos; 3.3 pts por 2; 1.6 pts por 1."
        },
        {
            num: 4,
            type: "COMPLETAR PÁRRAFO CLAVE (20%)",
            points: 5,
            correctAnswer: "Espacio (1): contrato  |  Espacio (2): interpretaciones  |  Espacio (3): exigirse",
            sourceReference: "Módulo 19: 'Mensajes de cierre' (pág. 11).",
            rationale: "El requerimiento alinea expectativas y reduce interpretaciones dispares. Lo que no está formalmente especificado carece de base objetiva para ser exigido.",
            rubric: "5 pts si completa los 3 términos; 3.3 pts por 2; 1.6 pts por 1."
        },
        {
            num: 5,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 5,
            correctAnswer: "Opción b) Explicar qué necesita el negocio, bajo qué reglas debe operar y cómo sabremos objetivamente que el resultado es correcto.",
            sourceReference: "Módulo 1: '¿Qué es un requerimiento?'",
            rationale: "El requerimiento funcional responde al 'qué' del negocio y sus criterios de verificación, no al 'cómo' técnico.",
            rubric: "5 pts si marca b; 0 pts si marca otra opción."
        },
        {
            num: 6,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 5,
            correctAnswer: "Opción a) Porque el proveedor no conoce el negocio; si no están escritas, pregunta, interpreta o no las implementa (las dos últimas generan retrabajo y fallas).",
            sourceReference: "Módulo 1: 'El problema de los supuestos'.",
            rationale: "Lo 'obvio' para el negocio es invisible para el desarrollador. La falta de formalización induce a interpretaciones libres u omisiones.",
            rubric: "5 pts si marca a; 0 pts si marca otra opción."
        },
        {
            num: 7,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 5,
            correctAnswer: "Opción c) El éxito aparece cuando el negocio especifica con precisión el «qué» y el proveedor diseña el «cómo».",
            sourceReference: "Módulo 2: 'Roles: quién sabe qué' — Mensaje de la capacitación.",
            rationale: "No corresponde al proveedor adivinar el negocio ni al negocio programar el software; la clave es la sinergia entre el 'qué' y el 'cómo'.",
            rubric: "5 pts si marca c; 0 pts si marca otra opción."
        },
        {
            num: 8,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 5,
            correctAnswer: "Opción c) Requerimiento funcional (comportamiento específico del sistema).",
            sourceReference: "Módulo 3: 'De la necesidad al requerimiento'.",
            rationale: "Describe directamente el comportamiento funcional exigido al software (impedir guardar con monto menor o igual a cero).",
            rubric: "5 pts si marca c; 0 pts si marca otra opción."
        },
        {
            num: 9,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 5,
            correctAnswer: "Opción a) Porque no define la condición exacta (ej. posterior a emisión), qué acción toma el sistema (bloquear) ni el mensaje visible al usuario.",
            sourceReference: "Módulo 8: 'Validaciones, mensajes y comportamiento ante errores'.",
            rationale: "La ambigüedad en validaciones impide probar el sistema objetivamente y deja el control a criterio subjetivo.",
            rubric: "5 pts si marca a; 0 pts si marca otra opción."
        },
        {
            num: 10,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 5,
            correctAnswer: "Opción b) Detallar la fórmula exacta, la fuente de las tasas vigentes, el criterio de redondeo y el comportamiento si falta una tarifa.",
            sourceReference: "Módulo 5: 'Ejemplo 2 - Regla de cálculo'.",
            rationale: "Una regla de cálculo exige fórmula matemática, fuente del parámetro, criterio de redondeo y tratamiento de errores por tarifas faltantes.",
            rubric: "5 pts si marca b; 0 pts si marca otra opción."
        },
        {
            num: 11,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 5,
            correctAnswer: "Opción a) Porque en los sistemas reales, buena parte de los incidentes y errores operativos ocurre precisamente en excepciones y escenarios poco frecuentes.",
            sourceReference: "Módulo 7: 'Flujos, escenarios y excepciones'.",
            rationale: "Los escenarios excepcionales no documentados son la principal fuente de caída o fallas en producción.",
            rubric: "5 pts si marca a; 0 pts si marca otra opción."
        },
        {
            num: 12,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 5,
            correctAnswer: "Opción b) DADO [condición inicial] / CUANDO [acción del usuario o evento] / ENTONCES [resultado observable del sistema].",
            sourceReference: "Módulo 9: 'Criterios de aceptación: convertir expectativas en pruebas'.",
            rationale: "Estructura BDD estándar que vincula precondición, acción disparadora y resultado verificable.",
            rubric: "5 pts si marca b; 0 pts si marca otra opción."
        },
        {
            num: 13,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 5,
            correctAnswer: "Opción b) El equipo funcional expresa la necesidad operativa del negocio y el impacto; el proveedor propone la métrica técnica que se acuerda mutuamente.",
            sourceReference: "Módulo 10: 'Requerimientos no funcionales'.",
            rationale: "El negocio aporta la perspectiva operativa y el impacto en servicio, y el proveedor aporta las métricas técnicas acordadas.",
            rubric: "5 pts si marca b; 0 pts si marca otra opción."
        },
        {
            num: 14,
            type: "SELECCIÓN MÚLTIPLE — ÚNICA OPCIÓN",
            points: 5,
            correctAnswer: "Opción b) Revisar el requerimiento como si no se conociera el proceso, detectando dudas que solo están en la cabeza del autor.",
            sourceReference: "Módulo 14: 'Técnica de revisión antes de enviar al proveedor'.",
            rationale: "Permite identificar vacíos de información y supuestos tácitos antes de entregar el documento a estimación o desarrollo.",
            rubric: "5 pts si marca b; 0 pts si marca otra opción."
        },
        {
            num: 15,
            type: "SELECCIÓN MÚLTIPLE — MÁS DE UNA OPCIÓN CORRECTA",
            points: 5,
            correctAnswer: "Opciones a, b, c, d y e (Todas son correctas).",
            sourceReference: "Módulo 6: 'Datos y campos: no basta con decir registrar información'.",
            rationale: "Los 5 aspectos (Nombre/significado, Tipo/formato, Obligatoriedad, Fuente y Editabilidad) forman parte de la matriz de definición de campos.",
            rubric: "5 pts si marca las 5; 4 pts por 4; 3 pts por 3; 2 pts por 2; 1 pt por 1."
        },
        {
            num: 16,
            type: "SELECCIÓN MÚLTIPLE — MÁS DE UNA OPCIÓN CORRECTA",
            points: 5,
            correctAnswer: "Opciones a, b, c y d (Todas excepto la e).",
            sourceReference: "Módulo 11: 'Palabras peligrosas: parecen claras, pero no lo son'.",
            rationale: "La opción e es una regla clara y cuantitativa. Las demás son términos ambiguos que trasladan interpretaciones no deseadas.",
            rubric: "5 pts si marca a, b, c y d sin marcar e; 3.75 pts por 3 correctas; 2.5 pts por 2 correctas; 0 pts si marca la errónea e."
        },
        {
            num: 17,
            type: "SELECCIÓN MÚLTIPLE — MÁS DE UNA OPCIÓN CORRECTA",
            points: 5,
            correctAnswer: "Opciones a, b, c y d (Todas excepto la e).",
            sourceReference: "Módulo 5: 'Tipos comunes de reglas'.",
            rationale: "Validación, Autorización, Derivación y Vigencia son reglas de negocio. La configuración de red es administración de infraestructura.",
            rubric: "5 pts si marca a, b, c y d sin marcar e; 3.75 pts por 3 correctas; 2.5 pts por 2 correctas; 0 pts si marca la errónea e."
        },
        {
            num: 18,
            type: "SELECCIÓN MÚLTIPLE — MÁS DE UNA OPCIÓN CORRECTA",
            points: 5,
            correctAnswer: "Opciones a, b, c, d y e (Todas son correctas).",
            sourceReference: "Módulo 4 y Módulo 17: 'Checklist y plantilla práctica'.",
            rationale: "Todos los puntos listados son pilares obligatorios de la estructura mínima para garantizar un requerimiento ejecutable y verificable.",
            rubric: "5 pts si marca las 5 opciones; 4 pts por 4; 3 pts por 3; 2 pts por 2; 1 pt por 1."
        },
        {
            num: 19,
            type: "SELECCIÓN MÚLTIPLE — MÁS DE UNA OPCIÓN CORRECTA",
            points: 5,
            correctAnswer: "Opciones a, b, c y d (Todas excepto la e).",
            sourceReference: "Módulo 12: 'Errores frecuentes y su impacto'.",
            rationale: "La opción e es una recomendación y buena práctica. Las opciones a, b, c y d son errores críticos identificados en la capacitación.",
            rubric: "5 pts si marca a, b, c y d sin marcar e; 3.75 pts por 3 correctas; 2.5 pts por 2 correctas; 0 pts si marca la errónea e."
        },
        {
            num: 20,
            type: "SELECCIÓN MÚLTIPLE — MÁS DE UNA OPCIÓN CORRECTA",
            points: 5,
            correctAnswer: "Opciones a, b, c y d (Todas excepto la e).",
            sourceReference: "Módulos 13, 16 y 19: 'Trazabilidad, gobierno y mensajes de cierre'.",
            rationale: "La opción e vulnera el principio de gobierno donde el negocio define el requerimiento. Las opciones a, b, c y d son principios esenciales de trazabilidad.",
            rubric: "5 pts si marca a, b, c y d sin marcar e; 3.75 pts por 3 correctas; 2.5 pts por 2 correctas; 0 pts si marca la errónea e."
        }
    ]
};

// -------------------------------------------------------------
// BUILD DOCUMENT FUNCTION
// -------------------------------------------------------------
function buildEvaluationDocument(versionConfig, filename) {
    const isV1 = versionConfig.questionsCount === 10;
    const timeMin = isV1 ? 25 : 45;
    const fillCount = isV1 ? 2 : 4;
    const singleCount = isV1 ? 5 : 10;
    const multiCount = isV1 ? 3 : 6;
    const pointsPerQ = isV1 ? 10 : 5;
    const versionTag = isV1 ? "VERSIÓN EJECUTIVA — 10 PREGUNTAS" : "VERSIÓN INTEGRAL — 20 PREGUNTAS";
    const qData = isV1 ? v1Questions : v2Questions;

    const children = [];

    // Header Table
    children.push(createHeaderTable(
        "EVALUACIÓN DE CONOCIMIENTOS",
        "Capacitación: Elaboración de Requerimientos Funcionales para Desarrollos",
        versionTag
    ));

    children.push(new Paragraph({ text: "", spacing: { after: 120 } }));

    // Student Info Table
    children.push(createStudentInfoTable());

    children.push(new Paragraph({ text: "", spacing: { after: 140 } }));

    // Instructions Box
    children.push(createInstructionsBox(timeMin, versionConfig.questionsCount, fillCount, singleCount, multiCount));

    children.push(new Paragraph({ text: "", spacing: { after: 160 } }));

    // SECTION 1: COMPLETAR PÁRRAFOS
    children.push(createSectionBanner(
        `SECCIÓN I: PREGUNTAS DE COMPLETAR PÁRRAFOS CLAVE (${fillCount} PREGUNTAS — 20% DEL TOTAL)`,
        "Complete los espacios en blanco con las palabras técnicas exactas expuestas en el material de capacitación."
    ));

    qData.fill.forEach(q => {
        children.push(...createFillQuestionParagraphs(q.num, q.points, q.title, q.template, q.wordBank, q.lines));
        children.push(new Paragraph({ text: "", spacing: { after: 80 } }));
    });

    children.push(new Paragraph({ text: "", spacing: { after: 100 } }));

    // SECTION 2: SELECCIÓN MÚLTIPLE - ÚNICA OPCIÓN
    children.push(createSectionBanner(
        `SECCIÓN II: SELECCIÓN MÚLTIPLE — ÚNICA RESPUESTA (${singleCount} PREGUNTAS)`,
        "Lea cuidadosamente cada enunciado y marque con una [ X ] únicamente la opción correcta."
    ));

    qData.single.forEach(q => {
        children.push(...createSingleChoiceParagraphs(q.num, q.points, q.question, q.context, q.options));
        children.push(new Paragraph({ text: "", spacing: { after: 60 } }));
    });

    children.push(new Paragraph({ text: "", spacing: { after: 100 } }));

    // SECTION 3: SELECCIÓN MÚLTIPLE - MÁS DE UNA OPCIÓN
    children.push(createSectionBanner(
        `SECCIÓN III: SELECCIÓN MÚLTIPLE — MÁS DE UNA RESPUESTA CORRECTA (${multiCount} PREGUNTAS)`,
        "Marque con una [ X ] TODAS las opciones que considere verdaderas. Cada pregunta contiene dos o más opciones correctas."
    ));

    qData.multi.forEach(q => {
        children.push(...createMultiChoiceParagraphs(q.num, q.points, q.question, q.context, q.options));
        children.push(new Paragraph({ text: "", spacing: { after: 60 } }));
    });

    // ANSWER KEY & RUBRIC
    children.push(...createAnswerKeySection(qData.answers, 100, versionTag));

    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Arial",
                        size: 20,
                        color: COLOR_CARBON
                    }
                }
            }
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 1134,    // ~2 cm
                            bottom: 1134, // ~2 cm
                            left: 1134,   // ~2 cm
                            right: 1134   // ~2 cm
                        }
                    }
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [
                                    new TextRun({
                                        text: "Capacitación: Elaboración de Requerimientos Funcionales | GTI BBV — Página ",
                                        size: 16,
                                        color: COLOR_GRIS_TXT,
                                        font: "Arial"
                                    }),
                                    new TextRun({
                                        children: [PageNumber.CURRENT],
                                        size: 16,
                                        bold: true,
                                        color: COLOR_MORADO,
                                        font: "Arial"
                                    }),
                                    new TextRun({
                                        text: " de ",
                                        size: 16,
                                        color: COLOR_GRIS_TXT,
                                        font: "Arial"
                                    }),
                                    new TextRun({
                                        children: [PageNumber.TOTAL_PAGES],
                                        size: 16,
                                        bold: true,
                                        color: COLOR_MORADO,
                                        font: "Arial"
                                    })
                                ]
                            })
                        ]
                    })
                },
                children: children
            }
        ]
    });

    return Packer.toBuffer(doc).then(buffer => {
        const fullPath = path.join(__dirname, filename);
        fs.writeFileSync(fullPath, buffer);
        console.log(`Document generated successfully: ${filename} (${buffer.length} bytes)`);
    });
}

async function main() {
    console.log("Generating 10-Question Evaluation Document...");
    await buildEvaluationDocument({ questionsCount: 10 }, "Evaluacion_Requerimientos_Funcionales_10_Preguntas.docx");

    console.log("Generating 20-Question Evaluation Document...");
    await buildEvaluationDocument({ questionsCount: 20 }, "Evaluacion_Requerimientos_Funcionales_20_Preguntas.docx");

    console.log("Both evaluation documents have been generated!");
}

main().catch(err => {
    console.error("Error generating documents:", err);
    process.exit(1);
});

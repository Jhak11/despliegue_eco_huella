/**
 * Carbon Footprint Calculator
 * Based on IPCC, GHG Protocol, and CEPAL methodologies
 */

export const questionnaireStructure = [
    // TRANSPORT CATEGORY
    {
        id: 'P1',
        category: 'transport',
        question: '¿Cuál es tu principal medio de transporte?',
        options: [
            { label: 'Caminar / bicicleta', value: 0 },
            { label: 'Transporte público', value: 300 },
            { label: 'Motocicleta', value: 600 },
            { label: 'Auto compartido', value: 1000 },
            { label: 'Auto particular', value: 2000 }
        ]
    },
    {
        id: 'P2',
        category: 'transport',
        question: '¿Cuántos kilómetros recorres por semana?',
        options: [
            { label: 'Menos de 20 km', value: 0.5 },
            { label: '20–50 km', value: 1 },
            { label: '51–100 km', value: 1.5 },
            { label: 'Más de 100 km', value: 2 }
        ]
    },
    {
        id: 'P3',
        category: 'transport',
        question: '¿Cuántos vuelos realizas al año?',
        options: [
            { label: 'Ninguno', value: 0 },
            { label: '1 nacional', value: 150 },
            { label: '2–3 nacionales', value: 300 },
            { label: '1 internacional', value: 900 },
            { label: 'Más de 1 internacional', value: 1800 }
        ]
    },

    // ENERGY CATEGORY
    {
        id: 'P4',
        category: 'energy',
        question: 'Tipo de energía principal en el hogar',
        options: [
            { label: 'Electricidad (red nacional)', value: 500 },
            { label: 'Electricidad + gas', value: 900 },
            { label: 'Gas / GLP', value: 1200 },
            { label: 'Leña / carbón', value: 1800 }
        ]
    },
    {
        id: 'P5',
        category: 'energy',
        question: 'Número de personas en el hogar',
        options: [
            { label: '1', value: 1 },
            { label: '2–3', value: 0.8 },
            { label: '4 o más', value: 0.6 }
        ]
    },

    // FOOD CATEGORY
    {
        id: 'P6',
        category: 'food',
        question: 'Tipo de dieta',
        options: [
            { label: 'Vegana', value: 700 },
            { label: 'Vegetariana', value: 900 },
            { label: 'Omnívora baja en carne', value: 1200 },
            { label: 'Omnívora', value: 1700 },
            { label: 'Alta en carne roja', value: 2500 }
        ]
    },
    {
        id: 'P7',
        category: 'food',
        question: 'Frecuencia de consumo de carne roja',
        options: [
            { label: 'Nunca', value: 0.6 },
            { label: '1 vez/semana', value: 0.8 },
            { label: '2–3 veces', value: 1 },
            { label: '4+ veces', value: 1.3 }
        ]
    },

    // WASTE CATEGORY
    {
        id: 'P8',
        category: 'waste',
        question: '¿Separás y reciclás residuos?',
        options: [
            { label: 'Siempre', value: 100 },
            { label: 'A veces', value: 250 },
            { label: 'Nunca', value: 500 }
        ]
    },
    {
        id: 'P9',
        category: 'waste',
        question: 'Uso de plásticos de un solo uso',
        options: [
            { label: 'Muy bajo', value: 100 },
            { label: 'Medio', value: 300 },
            { label: 'Alto', value: 600 }
        ]
    },

    // WATER CATEGORY
    {
        id: 'P10',
        category: 'water',
        question: 'Duración promedio de duchas',
        options: [
            { label: '< 5 min', value: 50 },
            { label: '5–10 min', value: 150 },
            { label: '> 10 min', value: 300 }
        ]
    },
    {
        id: 'P11',
        category: 'water',
        question: 'Uso eficiente del agua',
        options: [
            { label: 'Usa dispositivos ahorradores', value: 0.7 },
            { label: 'Uso promedio', value: 1 },
            { label: 'Uso ineficiente', value: 1.3 }
        ]
    }
];

/**
 * Calculate carbon footprint from questionnaire answers
 * @param {Object} answers - Object with question IDs as keys and selected values
 * @returns {Object} Breakdown of carbon footprint by category
 */
export function calculateCarbonFootprint(answers) {
    // Transport: (P1 × P2) + P3
    const transport = (answers.P1 * answers.P2) + answers.P3;

    // Energy: P4 × P5
    const energy = answers.P4 * answers.P5;

    // Food: P6 × P7
    const food = answers.P6 * answers.P7;

    // Waste: P8 + P9
    const waste = answers.P8 + answers.P9;

    // Water: P10 × P11
    const water = answers.P10 * answers.P11;

    // Total
    const total = transport + energy + food + waste + water;

    return {
        transport: Math.round(transport),
        energy: Math.round(energy),
        food: Math.round(food),
        waste: Math.round(waste),
        water: Math.round(water),
        total: Math.round(total)
    };
}

/**
 * Get regional baseline footprint (LATAM average)
 */
export const REGIONAL_BASELINE = 4000; // kg CO2e/year

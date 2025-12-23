export const TOPICS = [
    {
        id: 'carbon_footprint_101',
        title: 'Huella de Carbono Personal',
        description: 'Todo deja una huella, incluso lo invisible. Entiende tu impacto.',
        slides: [
            {
                id: 'welcome',
                title: ' Todo deja una huella',
                subtitle: 'incluso lo que parece invisible',
                text: 'No necesitas ser una fábrica ni manejar un camión gigante para generar impacto ambiental.\nCada acción cotidiana —desde prender una luz hasta pedir comida— deja una huella que casi nunca vemos, pero que sí existe.',
                subtext: 'Aquí no vas a encontrar sermones ni reglas imposibles.\nSolo información clara para entender mejor cómo funciona tu impacto diario.',
                buttonText: ' Empezar a explorar',
                type: 'intro'
            },
            {
                id: 'definition',
                title: 'Entonces… ¿qué es la huella de carbono?',
                text: 'La huella de carbono es una manera de estimar cuántos gases que contribuyen al calentamiento del planeta se generan a partir de nuestras actividades.',
                subtext: 'Aunque suele resumirse como “CO₂”, en realidad incluye varios gases. Para hacerlo simple, todo se expresa como si fuera dióxido de carbono.',
                highlight: 'Es una herramienta para entender, no para culpar.',
                type: 'concept'
            },
            {
                id: 'construction',
                title: 'Tu huella se construye poco a poco',
                text: 'No hay una sola acción que defina tu impacto ambiental. La huella personal es la suma de muchos hábitos que repetimos día tras día.',
                list: [
                    'Cómo te mueves',
                    'Qué tipo de energía usas',
                    'Qué comes y con qué frecuencia',
                    'Qué compras y cuánto desechas'
                ],
                footer: 'Por eso, cambiar pequeños hábitos puede tener más efecto de lo que parece.',
                type: 'list'
            },
            {
                id: 'sources',
                title: '¿De dónde viene la mayor parte de la huella diaria?',
                cards: [
                    { icon: '🚗', title: 'Transporte', text: 'Autos, motos y aviones usan combustibles que liberan gases cada vez que se mueven.' },
                    { icon: '⚡', title: 'Energía', text: 'La electricidad no es “invisible”. Dependiendo de cómo se genere, puede producir más o menos emisiones.' },
                    { icon: '🍽️', title: 'Alimentación', text: 'Producir alimentos requiere agua, energía y transporte. Algunos alimentos generan más impacto que otros.' },
                    { icon: '🛍️', title: 'Consumo', text: 'Todo lo que compras tuvo un proceso de fabricación y transporte. Incluso cuando se desecha, sigue generando impacto.' }
                ],
                type: 'grid'
            },
            {
                id: 'impact',
                title: 'Algunas acciones tienen más impacto que otras',
                text: 'Apagar una luz ayuda, pero no tiene el mismo efecto que cambiar la forma en que te mueves o reducir el desperdicio de alimentos.',
                highlight: 'La idea no es hacerlo todo perfecto, sino priorizar lo que más influye en tu huella.',
                type: 'concept'
            },
            {
                id: 'importance',
                title: '“¿De verdad importa lo que yo haga?”',
                text: 'Es normal pensarlo. Pero cuando millones de personas repiten los mismos hábitos, el impacto se vuelve enorme.',
                highlight: 'Un pequeño cambio repetido muchas veces puede generar una diferencia real a largo plazo.',
                type: 'concept'
            },
            {
                id: 'action',
                title: 'Primero entender, luego decidir',
                text: 'No se trata de imponer cambios ni de dejar de hacer todo lo que te gusta. Se trata de entender qué acciones tienen mayor impacto y decidir conscientemente.',
                subtext: 'Cuando entiendes tu huella, puedes elegir mejor dónde actuar.',
                buttonText: '✅ Terminar y Ganar Brotos',
                type: 'finish'
            }
        ]
    }
];

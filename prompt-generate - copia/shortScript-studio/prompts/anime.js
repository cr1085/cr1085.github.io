/**
 * prompts/anime.js
 * Specialized hooks, facts and CTAs for anime/manga content.
 * Used when topic is detected as anime-related or user selects Anime niche.
 */

export const AnimePrompts = {
  hooks: [
    '¿Sabías que el autor planeó esto desde el primer capítulo?',
    'Este personaje tenía un destino completamente diferente…',
    'La teoría que el fandom ignoró y resultó ser cierta.',
    'Oda/Kishimoto dejó esta pista hace 20 años y nadie la vio.',
    '¿Por qué este personaje es el más incomprendido del anime?',
    'El detalle en el fondo que cambia todo lo que pensabas.',
    'Esta escena parece inocente pero su significado es oscuro.',
    'El personaje más poderoso no es quien crees.',
  ],

  facts: {
    'one piece': [
      'El nombre de "D." en One Piece nunca ha sido explicado oficialmente, aunque lleva más de 25 años en la historia.',
      'Oda diseñó el final de One Piece antes de publicar el primer capítulo. La historia ya estaba completa.',
      'Zoro perdió conscientemente en Thriller Bark para proteger a Luffy, pero nunca lo mencionó.',
      'La letra "D" podría representar la "Voluntad de los Dioses de la Destrucción" según teorías bien fundamentadas.',
    ],
    'naruto': [
      'Kishimoto admitió que no planeó el Rasengan desde el inicio — surgió mientras dibujaba.',
      'Itachi sabía desde los 4 años que moriría joven. Cada decisión en su vida fue calculada.',
      'El verdadero nombre del Cuarto Hokage fue revelado 400 capítulos después de su aparición.',
    ],
    'attack on titan': [
      'El final de Attack on Titan fue escrito por Isayama antes de comenzar la serie.',
      'El nombre "Eren Jaeger" significa "libre cazador" — una contradicción perfecta con su destino.',
    ],
  },

  ctas: [
    '¿Cuál es tu teoría? Déjala en los comentarios 👇',
    'Comenta si eras del 1% que sabía esto.',
    'Etiqueta a ese amigo que se cree experto del anime 😂',
    'Guarda este video antes de que lo vea tu amigo spoiler.',
    '¿De acuerdo o no? Cuéntame.',
    'Sigue para más datos que el anime mainstream ignora.',
  ],

  hashtags: [
    '#anime', '#manga', '#otaku', '#animefacts', '#animetiktok',
    '#animeedit', '#fyp', '#parati', '#datosanime',
  ],
};

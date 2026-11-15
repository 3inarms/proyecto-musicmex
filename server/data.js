// Catálogo de MusicMex: artistas, canción de cada uno y qué mercancía ofrece.

const TYPES = {
  sudadera: { category: 'Sudaderas', label: 'Sudadera', price: 899, blurb: 'Sudadera con capucha, algodón grueso y estampado frontal.' },
  playera: { category: 'Playeras', label: 'Playera', price: 449, blurb: 'Playera de algodón con estampado de colección.' },
  gorra: { category: 'Gorras', label: 'Gorra', price: 399, blurb: 'Gorra ajustable con logo bordado.' },
  cd: { category: 'CDs', label: 'CD', price: 349, blurb: 'Disco compacto en estuche con librillo.' },
  vinilo: { category: 'Vinilos', label: 'Vinilo', price: 899, blurb: 'Disco de vinilo de 12 pulgadas, edición de colección.' },
  perfume: { category: 'Perfumes', label: 'Perfume', price: 749, blurb: 'Fragancia en spray de 50 ml inspirada en el universo del artista.' },
  vela: { category: 'Velas aromáticas', label: 'Vela aromática', price: 299, blurb: 'Vela de cera de soya con aroma suave, unas 40 horas de duración.' },
  peluche: { category: 'Peluches', label: 'Peluche', price: 449, blurb: 'Peluche suave de 30 cm, ideal para coleccionistas.' },
  poster: { category: 'Pósters', label: 'Póster', price: 199, blurb: 'Póster a color de 60 x 90 cm en papel couché.' },
  taza: { category: 'Tazas', label: 'Taza', price: 249, blurb: 'Taza de cerámica de 350 ml apta para microondas.' },
};

const ARTISTS = [
  { name: 'Twenty One Pilots', song: 'Holding on to You', merch: ['sudadera', 'gorra', 'cd', 'playera', 'poster'] },
  { name: 'The Weeknd', song: 'Call Out My Name', merch: ['sudadera', 'perfume', 'vinilo', 'gorra', 'playera'] },
  { name: 'Billie Eilish', song: 'CHIHIRO', merch: ['sudadera', 'peluche', 'cd', 'perfume', 'poster'] },
  { name: 'Michael Jackson', song: 'Liberian Girl', merch: ['playera', 'cd', 'vinilo', 'gorra', 'poster'] },
  { name: 'Post Malone', song: 'Stay', merch: ['sudadera', 'gorra', 'vela', 'cd', 'playera'] },
  { name: 'Melanie Martinez', song: 'The Last Two People On Earth', merch: ['peluche', 'perfume', 'vela', 'cd', 'sudadera'] },
  { name: 'Oliver Tree', song: 'Welcome to LA', merch: ['gorra', 'sudadera', 'playera', 'peluche', 'poster'] },
  { name: 'Sufjan Stevens', song: 'Video Game', merch: ['vinilo', 'playera', 'vela', 'cd', 'poster'] },
  { name: 'Mon Laferte', song: "Pa' Dónde Se Fue", merch: ['perfume', 'vela', 'cd', 'playera', 'poster'] },
  { name: 'Phil Collins', song: 'Another Day in Paradise', merch: ['vinilo', 'cd', 'playera', 'gorra', 'taza'] },
  { name: 'Hakuna Group Music', song: 'La Fila', merch: ['playera', 'sudadera', 'cd', 'gorra', 'vela'] },
];

// Imágenes de relleno (3 por producto). Después se pueden cambiar por fotos reales.
const COLORS = [['231F2E', 'B9A2E8'], ['332D44', 'E3A8C6'], ['1A1722', 'E6E1F0']];
function placeholders(label, artist) {
  const text = encodeURIComponent(`${label}\n${artist}`);
  return COLORS.map(([bg, fg]) => `https://placehold.co/800x800/${bg}/${fg}/png?text=${text}`);
}

function buildProducts() {
  const list = [];
  let id = 1;
  for (const artist of ARTISTS) {
    for (const key of artist.merch) {
      const t = TYPES[key];
      list.push({
        id,
        name: `${t.label} ${artist.name}`,
        artist: artist.name,
        category: t.category,
        price: t.price,
        stock: id % 17 === 0 ? 0 : 3 + ((id * 7) % 15),
        description: `${t.blurb} Colección de ${artist.name}.`,
        images: placeholders(t.label, artist.name),
      });
      id++;
    }
  }
  return list;
}

module.exports = { ARTISTS, buildProducts };
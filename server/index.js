// API de MusicMex. Sin dependencias: solo Node (v18 o superior).
// Arrancar:  node server/index.js
const http = require('http');
const crypto = require('crypto');
const { ARTISTS, buildProducts } = require('./data');

const PORT = Number(process.env.PORT) || 8000;
const USERS = [{ username: 'admin', password: '1234' }];

let products = buildProducts();
let nextId = products.length + 1;
const tokens = new Set(); // los tokens se pierden al reiniciar el servidor

// ---------- Canciones (previews de 30 s desde la API pública de iTunes) ----------
const norm = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, '').trim();

const songCache = new Map(); // artista -> { value, at }

async function lookupSong(artist, title) {
  const term = encodeURIComponent(`${artist} ${title}`);
  const url = `https://itunes.apple.com/search?term=${term}&media=music&entity=song&country=MX&limit=15`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const json = await res.json();
  const t = norm(title);
  const a = norm(artist).split(' ')[0];
  const results = (json.results || []).filter((r) => r.previewUrl);
  const hit =
    results.find((r) => norm(r.trackName).includes(t) && norm(r.artistName).includes(a)) ||
    results.find((r) => norm(r.trackName).includes(t));
  if (!hit) return null;
  return {
    title: hit.trackName,
    artist: hit.artistName,
    previewUrl: hit.previewUrl,
    artwork: (hit.artworkUrl100 || '').replace('100x100', '600x600') || null,
  };
}

async function getSong(artistName) {
  const entry = ARTISTS.find((a) => a.name === artistName);
  if (!entry) return null;
  const cached = songCache.get(artistName);
  // si falló antes, se reintenta pasado 1 minuto
  if (cached && (cached.value || Date.now() - cached.at < 60_000)) return cached.value;
  let value = null;
  try {
    value = await lookupSong(entry.name, entry.song);
  } catch (e) {
    console.warn(`[canción] ${entry.name}: ${e.message}`);
  }
  songCache.set(artistName, { value, at: Date.now() });
  return value;
}

// ---------- Utilidades HTTP ----------
function send(res, status, body) {
  const json = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) {
        reject(new Error('Cuerpo demasiado grande'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

function isAuthenticated(req) {
  const header = req.headers.authorization || '';
  const token = header.replace(/^(Token|Bearer)\s+/i, '');
  return !!token && tokens.has(token);
}

// ---------- Servidor ----------
const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return send(res, 204);

    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);
    const [root, idPart] = parts;

    if (parts.length === 0) return send(res, 200, { name: 'MusicMex API', ok: true });

    // Login (mismo endpoint que usaba la API de clase)
    if (root === 'api-token-auth' && req.method === 'POST') {
      const { username, password } = await readBody(req);
      const user = USERS.find((u) => u.username === username && u.password === password);
      if (!user) return send(res, 400, { message: 'Credenciales inválidas' });
      const token = crypto.randomBytes(20).toString('hex');
      tokens.add(token);
      return send(res, 200, { token });
    }

    // Todo lo demás requiere token
    if (!isAuthenticated(req)) return send(res, 401, { message: 'Sesión inválida o expirada' });

    if (root === 'meta' && req.method === 'GET') {
      return send(res, 200, {
        artists: ARTISTS.map((a) => a.name),
        categories: [...new Set(products.map((p) => p.category))],
      });
    }

    if (root === 'products') {
      const id = idPart ? Number(idPart) : null;

      if (!id && req.method === 'GET') {
        const q = norm(url.searchParams.get('q') || '');
        const artist = url.searchParams.get('artist');
        const category = url.searchParams.get('category');
        const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
        const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 10));

        const filtered = products.filter(
          (p) =>
            (!q || norm(`${p.name} ${p.artist} ${p.category}`).includes(q)) &&
            (!artist || p.artist === artist) &&
            (!category || p.category === category)
        );
        const total = filtered.length;
        return send(res, 200, {
          data: filtered.slice((page - 1) * limit, page * limit),
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        });
      }

      if (!id && req.method === 'POST') {
        const b = await readBody(req);
        const price = Number(b.price);
        if (!b.name || !b.artist || !b.category || !(price > 0)) {
          return send(res, 400, { message: 'Faltan campos obligatorios o el precio no es válido' });
        }
        const product = {
          id: nextId++,
          name: String(b.name),
          artist: String(b.artist),
          category: String(b.category),
          price,
          stock: Math.max(0, Number(b.stock) || 0),
          description: String(b.description || ''),
          images: Array.isArray(b.images) && b.images.length ? b.images.map(String) : ['https://placehold.co/800x800/231F2E/B9A2E8/png?text=MusicMex'],
        };
        products.unshift(product);
        return send(res, 201, product);
      }

      if (id) {
        const index = products.findIndex((p) => p.id === id);
        if (index === -1) return send(res, 404, { message: 'Producto no encontrado' });

        if (req.method === 'GET') {
          const song = await getSong(products[index].artist);
          return send(res, 200, { ...products[index], song });
        }
        if (req.method === 'PUT') {
          const b = await readBody(req);
          products[index] = { ...products[index], ...b, id };
          return send(res, 200, products[index]);
        }
        if (req.method === 'DELETE') {
          products.splice(index, 1);
          return send(res, 200, { ok: true });
        }
      }
    }

    return send(res, 404, { message: 'Ruta no encontrada' });
  } catch (e) {
    console.error(e);
    return send(res, 400, { message: e.message || 'Solicitud inválida' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API de MusicMex lista en el puerto ${PORT}`);
  console.log(`Productos cargados: ${products.length}  |  usuario de prueba: admin / 1234`);
});
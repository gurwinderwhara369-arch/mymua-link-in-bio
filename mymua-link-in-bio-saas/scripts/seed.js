const path = require('path');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');

const DB_PATH = path.resolve(__dirname, '..', 'data', 'database.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    template_id   INTEGER DEFAULT 1,
    is_admin      INTEGER DEFAULT 0,
    created_at    TEXT DEFAULT (datetime('now')),
    updated_at    TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS user_content (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    data    TEXT DEFAULT '{}'
  );
  CREATE TABLE IF NOT EXISTS bookings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id),
    data       TEXT NOT NULL,
    status     TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const hash = bcrypt.hashSync('demo1234', 10);

const demoData = [
  {
    username: 'anika',
    email: 'anika@example.com',
    template_id: 2,
    content: {
      name: 'Anika Rao',
      title: 'Bridal Makeup Artistry',
      bio: 'Trained at London\'s premier makeup academies and refined across three continents, I bring a global perspective to every bride\'s special day. My philosophy is simple — enhance, never mask. Using luxury, hypoallergenic products, I create looks that photograph flawlessly from sunrise ceremonies to late-night celebrations.',
      location: 'Mumbai, India',
      photo: 'https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=200&q=80',
      social: {
        phone: '+919999999999',
        whatsapp: '919999999999',
        instagram: 'anikaraomua',
        email: 'anika@bridalmua.com',
      },
      services: [
        { name: 'Bridal Package', price: '₹15K+', desc: 'Full bridal look incl. trial + HD airbrush' },
        { name: 'Engagement', price: '₹10K+', desc: 'Radiant looks for roka & sangeet' },
        { name: 'Reception', price: '₹12K+', desc: 'Glamorous evening reception looks' },
        { name: 'Airbrush', price: '₹18K+', desc: 'Flawless, long-lasting airbrush finish' },
        { name: 'Trial Makeup', price: '₹5K+', desc: 'Pre-wedding trial session' },
      ],
      gallery: [
        { url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80', alt: 'Traditional red lehenga bridal' },
        { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', alt: 'Soft glam bridal portrait' },
        { url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80', alt: 'Bridal makeup detail' },
        { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80', alt: 'Traditional bridal elegance' },
        { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80', alt: 'Bridal hairstyle and makeup' },
        { url: 'https://images.unsplash.com/photo-1597225244660-1cd128c6888a?w=600&q=80', alt: 'Elegant bridal portrait' },
        { url: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=400&q=80', alt: 'Bridal makeup session' },
        { url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80', alt: 'Modern elegant bridal look' },
      ],
      testimonials: [
        { name: 'Ananya Mehta', text: 'Anika didn\'t just do my makeup — she understood exactly what I wanted. I\'ve never felt more beautiful. The makeup lasted 14 hours without a single touch-up.', event: 'Wedding · March 2026' },
        { name: 'Kavya Patel', text: 'From the trial to the wedding day, Anika was an absolute professional. My skin looked flawless in every photo. She\'s a magician with an airbrush!', event: 'Reception · February 2026' },
        { name: 'Riya Kapoor', text: 'I was nervous about my destination wedding makeup, but Anika traveled with us and made sure every look was perfect across three events. Absolutely worth every penny.', event: 'Destination Wedding · January 2026' },
      ],
    },
  },
  {
    username: 'zara',
    email: 'zara@example.com',
    template_id: 3,
    content: {
      name: 'Zara Khan',
      title: 'Editorial Bridal Makeup',
      bio: 'With a background in fashion editorial and haute couture, I bring a photographer\'s eye to every bridal look. My work has been featured in Vogue India, Harper\'s Bazaar, and international bridal editorials. Every face tells a story — I just make sure the lighting\'s perfect.',
      location: 'Delhi, India',
      photo: 'https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=800&q=85',
      social: {
        phone: '+919999999999',
        whatsapp: '919999999999',
        instagram: 'zarakhanmua',
        email: 'zara@editorialbridal.com',
      },
      services: [
        { name: 'Bridal', price: '₹18K+', desc: 'Full look + trial' },
        { name: 'Engagement', price: '₹12K+', desc: 'Roka & sangeet' },
        { name: 'Reception', price: '₹15K+', desc: 'Evening glam' },
        { name: 'Editorial', price: '₹25K+', desc: 'Fashion / print' },
        { name: 'Airbrush', price: '₹20K+', desc: 'Flawless finish' },
      ],
      gallery: [
        { url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80', alt: 'Bridal editorial' },
        { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', alt: 'Soft glam' },
        { url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80', alt: 'Makeup detail' },
        { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80', alt: 'Traditional elegance' },
        { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80', alt: 'Full transformation' },
        { url: 'https://images.unsplash.com/photo-1597225244660-1cd128c6888a?w=600&q=80', alt: 'Bridal portrait' },
        { url: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=400&q=80', alt: 'BTS bridal' },
      ],
      testimonials: [
        { name: 'Mira Joshi', text: 'Zara doesn\'t just do makeup — she creates art. My bridal shoot looked like a Vogue editorial.', event: 'Bride · Goa Wedding' },
        { name: 'Neha Verma', text: 'Her editorial eye is unmatched. Every shot was magazine-ready. Absolute professional.', event: 'Bride · Destination Wedding' },
        { name: 'Riya Sethi', text: 'Featured in Harper\'s Bazaar because of Zara\'s incredible work. She\'s the best in the business.', event: 'Bride · Editorial Shoot' },
      ],
    },
  },
];

const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, email, password_hash, template_id, is_admin) VALUES (?, ?, ?, ?, ?)');
const insertContent = db.prepare('INSERT OR REPLACE INTO user_content (user_id, data) VALUES (?, ?)');
const checkUser = db.prepare('SELECT id, is_admin FROM users WHERE username = ?');

const adminHash = bcrypt.hashSync('admin1234', 12);
const tx = db.transaction(() => {
  const admin = checkUser.get('admin');
  if (!admin) {
    const info = db.prepare('INSERT INTO users (username, email, password_hash, template_id, is_admin) VALUES (?, ?, ?, 1, 1)').run('admin', 'admin@mymua.com', adminHash);
    db.prepare('INSERT INTO user_content (user_id, data) VALUES (?, ?)').run(info.lastInsertRowid, JSON.stringify({
      name: 'Admin',
      title: 'Site Admin',
      bio: '',
      location: '',
      services: [],
      gallery: [],
      testimonials: [],
      social: { phone: '', whatsapp: '', instagram: '', email: 'admin@mymua.com' },
    }));
    console.log('Created admin user "admin" with template-1');
  } else if (!admin.is_admin) {
    db.prepare('UPDATE users SET is_admin = 1 WHERE username = ?').run('admin');
    console.log('Promoted "admin" to admin');
  }

  for (const d of demoData) {
    const existing = checkUser.get(d.username);
    if (existing) {
      console.log(`User "${d.username}" already exists, updating content & template`);
      insertContent.run(existing.id, JSON.stringify(d.content));
      db.prepare('UPDATE users SET template_id = ? WHERE id = ?').run(d.template_id, existing.id);
    } else {
      const info = insertUser.run(d.username, d.email, hash, d.template_id, 0);
      insertContent.run(info.lastInsertRowid, JSON.stringify(d.content));
      console.log(`Created user "${d.username}" (id=${info.lastInsertRowid}) with template-${d.template_id}`);
    }
  }
});

tx();
console.log('\nDemo login: anika / demo1234, zara / demo1234');
console.log('Admin login: admin / admin1234 → /admin');
console.log('URLs: http://localhost:3000/anika (template-2)');
console.log('      http://localhost:3000/zara  (template-3)');

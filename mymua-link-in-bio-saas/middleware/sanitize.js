const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify')(new JSDOM('').window);

function sanitizeUserContent(content) {
  if (!content || typeof content !== 'object') return content;
  const c = JSON.parse(JSON.stringify(content));
  if (c.name) c.name = DOMPurify.sanitize(c.name, { ALLOWED_TAGS: [] });
  if (c.title) c.title = DOMPurify.sanitize(c.title, { ALLOWED_TAGS: [] });
  if (c.bio) c.bio = DOMPurify.sanitize(c.bio, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'] });
  if (c.location) c.location = DOMPurify.sanitize(c.location, { ALLOWED_TAGS: [] });
  if (c.photo) c.photo = DOMPurify.sanitize(c.photo, { ALLOWED_TAGS: [] });
  if (c.social) {
    if (c.social.phone) c.social.phone = DOMPurify.sanitize(c.social.phone, { ALLOWED_TAGS: [] });
    if (c.social.whatsapp) c.social.whatsapp = DOMPurify.sanitize(c.social.whatsapp, { ALLOWED_TAGS: [] });
    if (c.social.instagram) c.social.instagram = DOMPurify.sanitize(c.social.instagram, { ALLOWED_TAGS: [] });
    if (c.social.email) c.social.email = DOMPurify.sanitize(c.social.email, { ALLOWED_TAGS: [] });
  }
  if (Array.isArray(c.services)) {
    c.services.forEach(s => {
      if (s.name) s.name = DOMPurify.sanitize(s.name, { ALLOWED_TAGS: [] });
      if (s.desc) s.desc = DOMPurify.sanitize(s.desc, { ALLOWED_TAGS: [] });
      if (s.price) s.price = DOMPurify.sanitize(s.price, { ALLOWED_TAGS: [] });
    });
  }
  if (Array.isArray(c.gallery)) {
    c.gallery.forEach(g => {
      if (g.url) g.url = DOMPurify.sanitize(g.url, { ALLOWED_TAGS: [] });
      if (g.alt) g.alt = DOMPurify.sanitize(g.alt, { ALLOWED_TAGS: [] });
    });
  }
  if (Array.isArray(c.testimonials)) {
    c.testimonials.forEach(t => {
      if (t.name) t.name = DOMPurify.sanitize(t.name, { ALLOWED_TAGS: [] });
      if (t.text) t.text = DOMPurify.sanitize(t.text, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong'] });
      if (t.event) t.event = DOMPurify.sanitize(t.event, { ALLOWED_TAGS: [] });
    });
  }
  return c;
}

module.exports = { sanitizeUserContent };

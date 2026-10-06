import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import jwt from 'jsonwebtoken';

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_OMRaJf07gnUo@ep-autumn-boat-b5abmf7b-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 8000,
});

// Initialize database tables
async function initDb() {
  try {
    // 1. Contacts Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        place VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'unread',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Bookings Inquiries Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        unit_type VARCHAR(100) NOT NULL,
        preferred_floor VARCHAR(100),
        budget_range VARCHAR(100),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Booking Units / Sites Table (editable by Admin)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_units (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        unit_type VARCHAR(100) NOT NULL,
        tag VARCHAR(100) DEFAULT 'Available',
        price VARCHAR(100),
        image TEXT,
        features TEXT[] DEFAULT '{}',
        description TEXT,
        whatsapp_number VARCHAR(50) DEFAULT '+918888466667',
        display_order INT DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure price column exists if table already existed
    await pool.query(`
      ALTER TABLE booking_units ADD COLUMN IF NOT EXISTS price VARCHAR(100);
    `);

    // Seed default booking units if empty
    const unitsCountRes = await pool.query('SELECT COUNT(*) FROM booking_units');
    if (parseInt(unitsCountRes.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO booking_units (title, unit_type, tag, price, image, features, description, whatsapp_number, display_order, active)
        VALUES
        (
          'Retail Shops & Showrooms',
          'Shops / Showroom',
          'High Footfall',
          '₹ 20 Lakhs Onwards',
          '/gallary/store.jpg',
          ARRAY[
            'Ground & 1st Floor prime road visibility',
            'Double-height glass front facades',
            'Adjacent to 3-screen multiplex & food court',
            'Ample basement & surface customer parking'
          ],
          'Prime road-facing commercial shops and retail spaces designed for maximum customer visibility and high business turnover.',
          '+918888466667',
          1,
          true
        ),
        (
          'Luxurious 2 BHK Residences',
          '2 BHK Residence',
          'Premium Living',
          '₹ 35 Lakhs Onwards',
          '/building1.jpg',
          ARRAY[
            'Spacious master bedrooms & living halls',
            'Private balconies with panoramic views',
            'Designer entrance lobby & high-speed lifts',
            '24/7 biometric security & CCTV surveillance'
          ],
          'Elegant 2 BHK modern homes equipped with private balcony access and high-end construction quality.',
          '+918888466667',
          2,
          true
        ),
        (
          'Luxurious 3 BHK Residences',
          '3 BHK Residence',
          'Grand Lifestyle',
          '₹ 50 Lakhs Onwards',
          '/building2.jpg',
          ARRAY[
            'Grand living & dining spaces',
            'Premium fixtures & private access zones',
            'Abundant natural light & ventilation',
            'Reserved multi-level vehicle parking'
          ],
          'Expansive 3 BHK residences offering luxury lifestyle amenities in the heart of Solapur.',
          '+918888466667',
          3,
          true
        ),
        (
          'Corporate Office Spaces',
          'Corporate Office',
          'Business Hub',
          '₹ 18 Lakhs Onwards',
          '/gallary/office.jpg',
          ARRAY[
            'Flexible modular floor plates',
            '100% generator power backup for uninterrupted work',
            'Fiber-optic high-speed connectivity',
            'Conference facilities & cafeteria access'
          ],
          'Sophisticated corporate suites and offices tailored for modern enterprise and IT work environments.',
          '+918888466667',
          4,
          true
        )
      `);
      console.log('Default booking units with optional pricing seeded successfully.');
    }

    // 4. Blogs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        category VARCHAR(100) DEFAULT 'Commercial Real Estate',
        cover_image TEXT,
        excerpt TEXT,
        content TEXT NOT NULL,
        author VARCHAR(100) DEFAULT 'Paras Business Park',
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed sample blogs if empty
    const blogCountRes = await pool.query('SELECT COUNT(*) FROM blogs');
    if (parseInt(blogCountRes.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO blogs (title, slug, category, cover_image, excerpt, content, author, published)
        VALUES 
        (
          'Why Solapur is the Next Big Commercial Hub for Investors',
          'solapur-commercial-hub-investment',
          'Investment Insights',
          '/building1.jpg',
          'Discover why investing in strategic commercial spaces in Solapur is delivering high returns and long-term capital appreciation.',
          'Solapur is rapidly emerging as a premier industrial and commercial nexus in Maharashtra. With seamless connectivity to major state highways, Akkalkot Road, and Kolhapur Road, businesses in Paras Business Park benefit from unrivaled accessibility, modern amenities, high footfalls, and top-tier infrastructure.',
          'Paras Business Park Team',
          true
        ),
        (
          'Luxury Living Meets Modern Business: 2 & 3 BHK Residences',
          'luxury-living-2-3-bhk-residences',
          'Luxury Residences',
          '/building2.jpg',
          'Explore the luxury residential spaces featuring modern aesthetics, private elevator access, and panoramic city views.',
          'Paras Business Park offers an elite lifestyle with thoughtfully planned 2 & 3 BHK luxury residences. Enjoy private access, dedicated basement and ground parking, round-the-clock biometric security, and proximity to Solapurs best educational and healthcare centers.',
          'Architectural Desk',
          true
        ),
        (
          'Maximizing Footfalls: Premium Retail Showrooms & Multiplex',
          'maximizing-footfalls-retail-showrooms',
          'Commercial Spaces',
          '/gallary/store.jpg',
          'How our 3-screen multiplex and ground-floor showroom layout guarantees continuous high foot traffic for retailers.',
          'Retail success relies on location, visibility, and continuous customer flow. With an integrated 3-screen modern multiplex, multi-cuisine food court, and prime roadside visibility, Paras Business Park provides retail brands with maximum customer engagement and brand exposure.',
          'Retail Management',
          true
        )
      `);
      console.log('Sample blogs seeded successfully.');
    }

    console.log('PostgreSQL Neon DB initialized. Contacts, Bookings, Booking Units, and Blogs tables ready.');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

initDb();

const JWT_SECRET = process.env.JWT_SECRET || 'paras_business_park_secret_key_2026_9908';

// Middleware to verify admin token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
    req.user = user;
    next();
  });
}

// ----------------------------------------------------
// PUBLIC APIS: CONTACT
// ----------------------------------------------------

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, place, message } = req.body;

  if (!name || !email || !phone || !place || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO contacts (name, email, phone, place, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), email.trim(), phone.trim(), place.trim(), message.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Contact stored successfully in database.',
      contact: result.rows[0]
    });
  } catch (err) {
    console.error('Error saving contact to DB:', err);
    res.status(500).json({ error: 'Failed to save contact inquiry to database.' });
  }
});

// ----------------------------------------------------
// PUBLIC APIS: USER QUICK BOOKING REQUEST
// ----------------------------------------------------

app.post('/api/bookings', async (req, res) => {
  const { name, phone, unit_type, email, preferred_floor, budget_range, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and mobile number are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO bookings (name, phone, email, unit_type, preferred_floor, budget_range, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name.trim(),
        phone.trim(),
        (email || '').trim(),
        (unit_type || 'General Space Inquiry').trim(),
        (preferred_floor || '').trim(),
        (budget_range || '').trim(),
        (message || 'Direct Quick Booking Request').trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Booking request registered successfully in admin database.',
      booking: result.rows[0]
    });
  } catch (err) {
    console.error('Error saving booking request to DB:', err);
    res.status(500).json({ error: 'Failed to save booking request.' });
  }
});

// ----------------------------------------------------
// PUBLIC APIS: BOOKING UNITS (READ ONLY FOR PUBLIC)
// ----------------------------------------------------

app.get('/api/booking-units', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    const result = await pool.query(
      'SELECT * FROM booking_units WHERE active = true ORDER BY display_order ASC, id ASC'
    );
    res.json({ units: result.rows });
  } catch (err) {
    console.error('Error fetching booking units:', err);
    res.status(500).json({ error: 'Failed to fetch booking units.' });
  }
});

// ----------------------------------------------------
// PUBLIC APIS: BLOGS
// ----------------------------------------------------

app.get('/api/blogs', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    const result = await pool.query(
      'SELECT * FROM blogs WHERE published = true ORDER BY created_at DESC'
    );
    res.json({ blogs: result.rows });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Failed to fetch blogs.' });
  }
});

app.get('/api/blogs/:idOrSlug', async (req, res) => {
  const { idOrSlug } = req.params;
  try {
    const isNumeric = /^\d+$/.test(idOrSlug);
    let query = isNumeric
      ? 'SELECT * FROM blogs WHERE id = $1'
      : 'SELECT * FROM blogs WHERE slug = $1';
    
    const result = await pool.query(query, [idOrSlug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }
    res.json({ blog: result.rows[0] });
  } catch (err) {
    console.error('Error fetching blog post:', err);
    res.status(500).json({ error: 'Failed to fetch blog post.' });
  }
});

// ----------------------------------------------------
// ADMIN AUTHENTICATION
// ----------------------------------------------------

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  const adminUsername = process.env.ADMIN_USERNAME || 'parasbusinesspark@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'parasbusinesspark@9908';

  if (username === adminUsername && password === adminPassword) {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({
      success: true,
      token,
      admin: { username }
    });
  }

  return res.status(401).json({ error: 'Invalid username or password.' });
});

app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ----------------------------------------------------
// ADMIN: USER BOOKINGS LIST & INQUIRIES
// ----------------------------------------------------

app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    res.json({ bookings: result.rows });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

app.patch('/api/admin/bookings/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status is required.' });

  try {
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({ success: true, booking: result.rows[0] });
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ error: 'Failed to update booking status.' });
  }
});

app.delete('/api/admin/bookings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({ success: true, message: 'Booking request deleted successfully.' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'Failed to delete booking inquiry.' });
  }
});

// ----------------------------------------------------
// ADMIN: CONTACT INQUIRIES MANAGEMENT
// ----------------------------------------------------

app.get('/api/admin/contacts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json({ contacts: result.rows });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Failed to fetch contacts from database.' });
  }
});

app.patch('/api/admin/contacts/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status is required.' });

  try {
    const result = await pool.query(
      'UPDATE contacts SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    res.json({ success: true, contact: result.rows[0] });
  } catch (err) {
    console.error('Error updating contact status:', err);
    res.status(500).json({ error: 'Failed to update contact status.' });
  }
});

app.delete('/api/admin/contacts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    res.json({ success: true, message: 'Contact deleted successfully.' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({ error: 'Failed to delete contact.' });
  }
});

// ----------------------------------------------------
// ADMIN: BOOKING UNITS / SITES MANAGEMENT (CRUD)
// ----------------------------------------------------

app.get('/api/admin/booking-units', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM booking_units ORDER BY display_order ASC, id ASC');
    res.json({ units: result.rows });
  } catch (err) {
    console.error('Error fetching admin booking units:', err);
    res.status(500).json({ error: 'Failed to fetch booking units.' });
  }
});

app.post('/api/admin/booking-units', authenticateToken, async (req, res) => {
  const { title, unit_type, tag, price, image, features, description, whatsapp_number, display_order, active } = req.body;

  if (!title || !unit_type) {
    return res.status(400).json({ error: 'Title and unit type are required.' });
  }

  const featuresArray = Array.isArray(features)
    ? features
    : typeof features === 'string'
    ? features.split('\n').map((f) => f.trim()).filter(Boolean)
    : [];

  try {
    const result = await pool.query(
      `INSERT INTO booking_units (title, unit_type, tag, price, image, features, description, whatsapp_number, display_order, active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [
        title.trim(),
        unit_type.trim(),
        (tag || 'Available').trim(),
        (price || '').trim(),
        image || '/gallary/store.jpg',
        featuresArray,
        description || '',
        whatsapp_number || '+918888466667',
        parseInt(display_order || 0, 10),
        active !== undefined ? active : true
      ]
    );

    res.status(201).json({ success: true, unit: result.rows[0] });
  } catch (err) {
    console.error('Error creating booking unit:', err);
    res.status(500).json({ error: 'Failed to create booking unit.' });
  }
});

app.put('/api/admin/booking-units/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, unit_type, tag, price, image, features, description, whatsapp_number, display_order, active } = req.body;

  if (!title || !unit_type) {
    return res.status(400).json({ error: 'Title and unit type are required.' });
  }

  const featuresArray = Array.isArray(features)
    ? features
    : typeof features === 'string'
    ? features.split('\n').map((f) => f.trim()).filter(Boolean)
    : [];

  try {
    const result = await pool.query(
      `UPDATE booking_units
       SET title = $1,
           unit_type = $2,
           tag = $3,
           price = $4,
           image = $5,
           features = $6,
           description = $7,
           whatsapp_number = $8,
           display_order = $9,
           active = $10,
           updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        title.trim(),
        unit_type.trim(),
        (tag || 'Available').trim(),
        (price || '').trim(),
        image || '/gallary/store.jpg',
        featuresArray,
        description || '',
        whatsapp_number || '+918888466667',
        parseInt(display_order || 0, 10),
        active !== undefined ? active : true,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking unit not found.' });
    }

    res.json({ success: true, unit: result.rows[0] });
  } catch (err) {
    console.error('Error updating booking unit:', err);
    res.status(500).json({ error: 'Failed to update booking unit.' });
  }
});

app.delete('/api/admin/booking-units/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM booking_units WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking unit not found.' });
    }

    res.json({ success: true, message: 'Booking unit deleted successfully.' });
  } catch (err) {
    console.error('Error deleting booking unit:', err);
    res.status(500).json({ error: 'Failed to delete booking unit.' });
  }
});

// ----------------------------------------------------
// ADMIN: BLOG POSTS CRUD MANAGEMENT
// ----------------------------------------------------

app.get('/api/admin/blogs', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
    res.json({ blogs: result.rows });
  } catch (err) {
    console.error('Error fetching admin blogs:', err);
    res.status(500).json({ error: 'Failed to fetch blogs.' });
  }
});

app.post('/api/admin/blogs', authenticateToken, async (req, res) => {
  const { title, category, cover_image, excerpt, content, author, published } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const slug = (req.body.slug || title)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .concat('-', Date.now().toString().slice(-4));

  try {
    const result = await pool.query(
      `INSERT INTO blogs (title, slug, category, cover_image, excerpt, content, author, published, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [
        title.trim(),
        slug,
        (category || 'General Real Estate').trim(),
        cover_image || '/building1.jpg',
        excerpt || content.slice(0, 160),
        content,
        author || 'Paras Business Park',
        published !== undefined ? published : true
      ]
    );

    res.status(201).json({ success: true, blog: result.rows[0] });
  } catch (err) {
    console.error('Error creating blog post:', err);
    res.status(500).json({ error: 'Failed to create blog post.' });
  }
});

app.put('/api/admin/blogs/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, category, cover_image, excerpt, content, author, published, slug } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE blogs
       SET title = $1,
           category = $2,
           cover_image = $3,
           excerpt = $4,
           content = $5,
           author = $6,
           published = $7,
           slug = COALESCE($8, slug),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        title.trim(),
        category || 'General',
        cover_image || '/building1.jpg',
        excerpt || content.slice(0, 160),
        content,
        author || 'Paras Business Park',
        published !== undefined ? published : true,
        slug || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found.' });
    }

    res.json({ success: true, blog: result.rows[0] });
  } catch (err) {
    console.error('Error updating blog post:', err);
    res.status(500).json({ error: 'Failed to update blog post.' });
  }
});

app.delete('/api/admin/blogs/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM blogs WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found.' });
    }

    res.json({ success: true, message: 'Blog post deleted successfully.' });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ error: 'Failed to delete blog post.' });
  }
});

// 404 JSON fallback for /api routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;

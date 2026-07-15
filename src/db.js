const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL. Add it to your .env file.");
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS quotes (
      id SERIAL PRIMARY KEY,
      quote_text TEXT NOT NULL,
      author VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await pool.query(createTableQuery);
}

async function getQuotes(search = "") {
  const trimmedSearch = search.trim();

  if (!trimmedSearch) {
    const result = await pool.query(
      `
      SELECT id, quote_text, author, created_at
      FROM quotes
      ORDER BY created_at ASC, id ASC;
      `
    );

    return result.rows;
  }

  const result = await pool.query(
    `
    SELECT id, quote_text, author, created_at
    FROM quotes
    WHERE quote_text ILIKE $1 OR COALESCE(author, '') ILIKE $1
    ORDER BY created_at ASC, id ASC;
    `,
    [`%${trimmedSearch}%`]
  );

  return result.rows;
}

async function getQuoteById(id) {
  const result = await pool.query(
    `
    SELECT id, quote_text, author, created_at
    FROM quotes
    WHERE id = $1;
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function addQuote(quoteText, author) {
  await pool.query(
    `
    INSERT INTO quotes (quote_text, author)
    VALUES ($1, NULLIF($2, ''));
    `,
    [quoteText.trim(), author.trim()]
  );
}

async function updateQuote(id, quoteText, author) {
  await pool.query(
    `
    UPDATE quotes
    SET quote_text = $2,
        author = NULLIF($3, '')
    WHERE id = $1;
    `,
    [id, quoteText.trim(), author.trim()]
  );
}

async function deleteQuote(id) {
  await pool.query(
    `
    DELETE FROM quotes
    WHERE id = $1;
    `,
    [id]
  );
}

module.exports = {
  initializeDatabase,
  getQuotes,
  getQuoteById,
  addQuote,
  updateQuote,
  deleteQuote,
};

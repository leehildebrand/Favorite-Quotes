const { neon } = require("@neondatabase/serverless");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL. Add it to your .env file.");
}

const sql = neon(connectionString);

async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS quotes (
      id SERIAL PRIMARY KEY,
      quote_text TEXT NOT NULL,
      author VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

async function getQuotes(search = "") {
  const trimmedSearch = search.trim();

  if (!trimmedSearch) {
    return sql`
      SELECT id, quote_text, author, created_at
      FROM quotes
      ORDER BY created_at ASC, id ASC;
    `;
  }

  const pattern = `%${trimmedSearch}%`;
  return sql`
    SELECT id, quote_text, author, created_at
    FROM quotes
    WHERE quote_text ILIKE ${pattern} OR COALESCE(author, '') ILIKE ${pattern}
    ORDER BY created_at ASC, id ASC;
  `;
}

async function getQuoteById(id) {
  const rows = await sql`
    SELECT id, quote_text, author, created_at
    FROM quotes
    WHERE id = ${id};
  `;

  return rows[0] || null;
}

async function addQuote(quoteText, author) {
  await sql`
    INSERT INTO quotes (quote_text, author)
    VALUES (${quoteText.trim()}, NULLIF(${author.trim()}, ''));
  `;
}

async function updateQuote(id, quoteText, author) {
  await sql`
    UPDATE quotes
    SET quote_text = ${quoteText.trim()},
        author = NULLIF(${author.trim()}, '')
    WHERE id = ${id};
  `;
}

async function deleteQuote(id) {
  await sql`
    DELETE FROM quotes
    WHERE id = ${id};
  `;
}

module.exports = {
  initializeDatabase,
  getQuotes,
  getQuoteById,
  addQuote,
  updateQuote,
  deleteQuote,
};

require("dotenv").config();

const path = require("path");
const express = require("express");
const { initializeDatabase, getQuotes, addQuote } = require("./db");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const quotes = await getQuotes(q);

    res.render("index", {
      title: "Favorite Quotes",
      quotes,
      searchTerm: q,
      error: null,
      form: {
        quoteText: "",
        author: "",
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post("/quotes", async (req, res, next) => {
  try {
    const quoteText = typeof req.body.quoteText === "string" ? req.body.quoteText : "";
    const author = typeof req.body.author === "string" ? req.body.author : "";
    const q = typeof req.query.q === "string" ? req.query.q : "";

    if (!quoteText.trim()) {
      const quotes = await getQuotes(q);

      return res.status(400).render("index", {
        title: "Favorite Quotes",
        quotes,
        searchTerm: q,
        error: "Quote text is required.",
        form: {
          quoteText,
          author,
        },
      });
    }

    await addQuote(quoteText, author);

    const redirectSearch = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    return res.redirect(`/${redirectSearch}`);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send("Something went wrong while loading your quotes.");
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Favorite Quotes running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });

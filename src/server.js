require("dotenv").config();

const path = require("path");
const express = require("express");
const { initializeDatabase, getQuotes, getQuoteById, addQuote, updateQuote, deleteQuote } = require("./db");

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
    });
  } catch (error) {
    next(error);
  }
});

app.get("/new", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";

  res.render("new", {
    title: "Add a Quote",
    searchTerm: q,
    error: null,
    form: {
      quoteText: "",
      author: "",
    },
  });
});

app.post("/quotes", async (req, res, next) => {
  try {
    const quoteText = typeof req.body.quoteText === "string" ? req.body.quoteText : "";
    const author = typeof req.body.author === "string" ? req.body.author : "";

    if (!quoteText.trim()) {
      const q = typeof req.query.q === "string" ? req.query.q : "";

      return res.status(400).render("new", {
        title: "Add a Quote",
        searchTerm: q,
        error: "Quote text is required.",
        form: {
          quoteText,
          author,
        },
      });
    }

    await addQuote(quoteText, author);

    return res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.get("/quotes/:id/edit", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const quote = await getQuoteById(id);

    if (!quote) {
      return res.status(404).send("Quote not found.");
    }

    return res.render("edit", {
      title: "Edit Quote",
      searchTerm: q,
      error: null,
      quote,
      form: {
        quoteText: quote.quote_text,
        author: quote.author || "",
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post("/quotes/:id/edit", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const quoteText = typeof req.body.quoteText === "string" ? req.body.quoteText : "";
    const author = typeof req.body.author === "string" ? req.body.author : "";
    const q = typeof req.query.q === "string" ? req.query.q : "";

    if (!quoteText.trim()) {
      const quote = await getQuoteById(id);

      if (!quote) {
        return res.status(404).send("Quote not found.");
      }

      return res.status(400).render("edit", {
        title: "Edit Quote",
        searchTerm: q,
        error: "Quote text is required.",
        quote,
        form: {
          quoteText,
          author,
        },
      });
    }

    await updateQuote(id, quoteText, author);

    const redirectSearch = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    return res.redirect(`/${redirectSearch}`);
  } catch (error) {
    next(error);
  }
});

app.post("/quotes/:id/delete", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const q = typeof req.query.q === "string" ? req.query.q : "";

    await deleteQuote(id);

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

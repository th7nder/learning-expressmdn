var Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// Display list of all Genre.
exports.genre_list = function(req, res, next) {
  Genre.find()
    .sort([["name", "ascending"]])
    .exec((err, genres) => {
      if (err) next(err);

      res.render("genre_list", { title: "Genre list", genre_list: genres });
    });
};

// Display detail page for a specific Genre.
// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
  async.parallel(
    {
      genre: function(callback) {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_books: function(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        var err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_books: results.genre_books
      });
    }
  );
};
// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
  res.render("genre_form", { title: "Create genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  body("name", "Genre name is required")
    .isLength({ min: 1 })
    .trim(),
  sanitizeBody("name")
    .trim()
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name });
    if (!errors.isEmpty()) {
      return res.render("genre_form", {
        title: "Create genre",
        genre: genre,
        errors: errors.array()
      });
    }

    Genre.findOne({ name: genre.name }).exec((err, found) => {
      if (err) return next(err);
      if (found) return res.redirect(found.url);

      genre.save(err => {
        if (err) return next(err);
        return res.redirect(genre.url);
      });
    });
  }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
  const { id } = req.params;

  Promise.all([Genre.findById(id).exec(), Book.find({ genre: id }).exec()])
    .then(results => {
      const [genre, books] = results;
      if (!genre) {
        return res.redirect("/catalog/genres");
      }

      res.render("genre_delete", { title: "Delete genre", genre, books });
    })
    .catch(err => next(err));
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next) {
  const { genreid: id } = req.body;

  Promise.all([Genre.findById(id).exec(), Book.find({ genre: id }).exec()])
    .then(results => {
      const [genre, books] = results;
      if (!genre) {
        const err = new Error("genre doesn't exists");
        err.status = 404;
        return next(err);
      }

      if (books.length) {
        return res.render("genre_delete", {
          title: "Delete genre",
          genre,
          books
        });
      }

      Genre.findByIdAndDelete(id)
        .then(() => res.redirect("/catalog/genres"))
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {
  const { id } = req.params;

  Genre.findById(id)
    .exec()
    .then(genre => {
      if (!genre) return res.redirect("/catalog/genres");

      res.render("genre_form", { title: "Update genre", genre });
    })
    .catch(err => next(err));
};

// Handle Genre update on POST.
exports.genre_update_post = [
  body("name", "Name must be supplied")
    .trim()
    .isLength({ min: 1 }),
  sanitizeBody("name")
    .trim()
    .escape(),
  function(req, res, next) {
    const { id } = req.params;
    const { name } = req.body;
    const errors = validationResult(req);
    const genre = new Genre({ name, _id: id });

    if (!errors.isEmpty()) {
      return res.render("genre_form", {
        title: "Update genre",
        errors: errors.array(),
        genre
      });
    }

    Genre.findByIdAndUpdate(id, genre)
      .exec()
      .then(genre => res.redirect(genre.url))
      .catch(err => next(err));
  }
];

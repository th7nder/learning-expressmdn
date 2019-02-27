const mongoose = require("mongoose");
const moment = require("moment");

const { Schema } = mongoose;
const BookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, required: true, ref: "Book" },
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance"
  },
  due_back: { type: Date, default: Date.now }
});

BookInstanceSchema.virtual("url").get(function() {
  return `/catalog/bookinstance/${this._id}`;
});

BookInstanceSchema.virtual("due_back_form").get(function() {
  return this.due_back ? moment(this.due_back).format("YYYY-MM-DD") : "";
});

BookInstanceSchema.virtual("due_back_formatted").get(function() {
  return moment(this.due_back).format("MMMM Do, YYYY");
});

module.exports = mongoose.model("BookInstance", BookInstanceSchema);

const mongoose = require("mongoose");
const moment = require("moment");

const { Schema } = mongoose;
const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxlength: 100 },
  family_name: { type: String, required: true, maxlength: 100 },
  date_of_birth: Date,
  date_of_death: Date
});

AuthorSchema.virtual("name").get(function() {
  return `${this.family_name} ${this.first_name}`;
});

AuthorSchema.virtual("lifespan").get(function() {
  return (
    this.date_of_death.getYear() - this.date_of_birth.getYear()
  ).toString();
});

AuthorSchema.virtual("liferange").get(function() {
  if (!this.date_of_birth) return "";

  const birth = this.date_of_birth
    ? moment(this.date_of_birth).format("MMMM Do, YYYY")
    : "";
  const death = this.date_of_death
    ? moment(this.date_of_death).format("MMMM Do, YYYY")
    : "";

  return `${birth} - ${death}`;
});

AuthorSchema.virtual("birth_form").get(function() {
  const { date_of_birth: birth } = this;
  return birth ? moment(birth).format("YYYY-MM-DD") : "";
});

AuthorSchema.virtual("death_form").get(function() {
  const { date_of_death: death } = this;
  return death ? moment(death).format("YYYY-MM-DD") : "";
});

AuthorSchema.virtual("url").get(function() {
  return `/catalog/author/${this._id}`;
});

module.exports = mongoose.model("Author", AuthorSchema);

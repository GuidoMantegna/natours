const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');


const tourSchema = new mongoose.Schema(
  // SCHEMA DEFINITION
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // Here we validate if the price discount is actually lower than the price itself.
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  // SCHEMA OPTIONS
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// VIRTUAL PROPERTIES
/* - this virtual property here will basically be created each time
 that we get some data out of the database. 
 - we used this regular function here because, an arrow function does not get 
 its own 'this' keyword. Here we actually need the 'this' keyword because it is 
 going to be pointing to the current document. */
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs ONLY before .save() and .create()
/* - 'pre' for pre middleware which is gonna run before an actual event.
 - that event in this case is the 'save' event.
 - the func. will be called before an actual document is saved to the database. */
tourSchema.pre('save', function (next) {
  /* - This refers to the current document itself
   - We are gonna create a slug using slugify library
   - Here we also have next() basically to call the next middleware in the stack */
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
/* Instead of defining a 'find' hook, we can use a RegEx to match all the commands
that start with the name find (find, findOne, findAndUpdate, findAndDelete...) */
tourSchema.pre(/^find/, function (next) {
  /* 'this' is now a query object, so we can chain all of the methods that we have for queries. */
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

/* this middleware is gonna run after the query has already executed. 
And so, therefore, it can have access to the documents that were returned. */
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE
/* Instead of using the aggregation pipeline in each tour controller, we do it
here in the model to apply it for all of them.
in aggregation middleware 'this' is going to point to the current aggregation object. */
tourSchema.pre('aggregate', function (next) {
  // It will removes from the outputs all the documents that have secretTour set to true
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

// MODEL
// NAME, SCHEMA - model name (tour) should be with an uppercase "T" as a convention
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

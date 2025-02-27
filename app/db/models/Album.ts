import mongoose, { type InferSchemaType } from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      minLength: [3, "That's too short"],
    },
    artist: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      min: [1900, "That's too old, srsly"],
      max: [5555, "That's the future, man"],
    },
    runningTime: Number,
    tracks: [String],
    user: {
      type: String,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Generate unique slug-based IDs
albumSchema.pre("save", async function (next) {
  if (this._id) {
    return next(); // Skip if _id is already set
  }

  // Create base slug from title and artist
  const baseSlug = `${this.title}-by-${this.artist}`
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();

  // Add user reference for uniqueness if available
  let slug = this.user ? `${baseSlug}-${this.user}` : baseSlug;

  // Check if the slug exists and make it unique if needed
  let exists = true;
  let counter = 0;
  let uniqueSlug = slug;

  while (exists) {
    const existingDoc = await mongoose.models.Album.findOne({
      _id: uniqueSlug,
    });
    if (!existingDoc) {
      exists = false;
    } else {
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }
  }

  this._id = uniqueSlug;
  next();
});

// Infer TypeScript type for the schema
export type AlbumType = InferSchemaType<typeof albumSchema>;

const Album = mongoose.model<AlbumType>("Album", albumSchema);

export default Album;

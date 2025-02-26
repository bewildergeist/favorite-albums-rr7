import mongoose, { type InferSchemaType } from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minLength: [3, "That's too short"],
    },
    artist: {
      type: String,
      required: true,
    },
    genres: [String],
    year: {
      type: Number,
      min: [1900, "That's too old, srsly"],
      max: [5555, "That's the future, man"],
    },
    runningTime: Number,
    tracks: [String],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Infer TypeScript type for the schema
export type AlbumType = InferSchemaType<typeof albumSchema> & {
  id: string;
};

const Album = mongoose.model<AlbumType>("Album", albumSchema);

export default Album;

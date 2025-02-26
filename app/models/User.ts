import mongoose, { type InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minLength: [3, "That's too short"],
  },
  password: {
    type: String,
    required: true,
    trim: true,
    // Hide the password from the response by default
    select: false,
  },
});

// Infer TypeScript type for the schema
export type UserType = InferSchemaType<typeof userSchema> & {
  id: string;
};

const User = mongoose.model<UserType>("User", userSchema);

export default User;

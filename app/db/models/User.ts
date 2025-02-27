import mongoose, { type InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
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

// Add middleware to set _id to username when creating a new user
userSchema.pre("save", function (next) {
  // Only set _id if this is a new document (first creation)
  if (this.isNew) {
    this._id = this.username;
  }
  next();
});

// Add pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Infer TypeScript type for the schema
export type UserType = InferSchemaType<typeof userSchema>;

const User = mongoose.model<UserType>("User", userSchema);

export default User;

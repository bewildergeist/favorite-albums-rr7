import { createCookie } from "react-router";

export const sessionCookie = createCookie("__session", {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7, // 1 week
  secrets: [process.env.COOKIE_SECRET ?? "s3cr3t"],
});

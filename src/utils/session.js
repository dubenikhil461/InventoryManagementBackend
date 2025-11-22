import { auth } from "../lib/auth.js";

export async function getUserSession(req, res) {
  const session = await auth.getSession(req, res);
  return session?.user;
}

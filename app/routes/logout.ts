import { redirect } from "react-router";
import { destroySession, getSession } from "~/session/session.server";
import type { Route } from "./+types/logout";

export function loader() {
  return redirect("/login");
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

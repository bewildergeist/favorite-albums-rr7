import {
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { getSession } from "./session/session.server";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>My favorite albums</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-orange-50 p-4 font-sans text-amber-900">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return {
    isAuthenticated: session.has("userId"),
  };
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { isAuthenticated } = loaderData;
  return (
    <>
      <header className="mb-4 flex flex-row items-center border-b border-orange-200 pb-3">
        <Link to="/albums" className="text-orange-600 hover:underline">
          Home
        </Link>
        <Link to="/albums/new" className="ml-3 text-orange-600 hover:underline">
          New album
        </Link>
        {isAuthenticated ? (
          <Form method="post" action="/logout" className="ml-auto inline">
            <button className="text-orange-600 hover:underline">Logout</button>
          </Form>
        ) : (
          <Link to="/login" className="ml-auto text-orange-600 hover:underline">
            Login
          </Link>
        )}
      </header>
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

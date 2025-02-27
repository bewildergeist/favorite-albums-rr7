import { commitSession, getSession } from "~/session/session.server";
import type { Route } from "./+types/signup";
import { data, Form, Link, redirect } from "react-router";
import User from "~/db/models/User";

// LOADER ========================================================= //
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.get("userId")) {
    return redirect("/albums");
  }
  return null;
}

// COMPONENT ====================================================== //
export default function SignUp({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <h1 className="mb-1 text-lg font-bold">Sign up</h1>
      {actionData?.errorMessage ? (
        <p className="my-3 font-bold text-red-500">{actionData.errorMessage}</p>
      ) : null}
      <Form method="post" className="text-inherit">
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Username"
          required
          className="my-3 block w-full rounded border border-zinc-300 bg-white px-2 py-1 lg:w-1/2"
        />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          required
          className="my-3 block w-full rounded border border-zinc-300 bg-white px-2 py-1 lg:w-1/2"
        />
        <input
          type="password"
          name="repeatPassword"
          id="repeatPassword"
          placeholder="Repeat password"
          required
          className="my-3 block w-full rounded border border-zinc-300 bg-white px-2 py-1 lg:w-1/2"
        />
        <div className="flex flex-row items-center gap-3">
          <button type="submit" className="my-3 rounded border p-2">
            Sign up
          </button>
          <span className="italic">or</span>
          <Link to="/login" className="underline">
            Log in
          </Link>
        </div>
      </Form>
    </div>
  );
}

// ACTION ========================================================= //
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString().trim();
  const repeatPassword = formData.get("repeatPassword")?.toString().trim();

  // Check for existing input data -------------------------------- //
  if (!username || !password || !repeatPassword) {
    return data({ errorMessage: "Please fill in all fields" }, { status: 400 });
  }

  // Check for correct repeat password ---------------------------- //
  if (password !== repeatPassword) {
    return data(
      { errorMessage: "The entered passwords are not equal" },
      { status: 400 },
    );
  }

  // Check for password requirements ------------------------------ //
  if (password?.length < 8) {
    return data(
      { errorMessage: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  // Create user -------------------------------------------------- //
  try {
    const user = await User.create({
      username,
      password,
    });

    const session = await getSession(request.headers.get("Cookie"));
    session.set("userId", user._id);

    // Redirect and set cookie ------------------------------------ //
    return redirect("/albums", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error: Error | any) {
    return data(
      {
        errorMessage:
          error.message ??
          error.errors
            ?.map((error: { message: any }) => error.message)
            .join(", "),
      },
      { status: 400 },
    );
  }
}

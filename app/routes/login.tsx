import bcrypt from "bcryptjs";
import type { Route } from "./+types/login";
import { commitSession, getSession } from "~/session/session.server";
import { data, Form, Link, redirect } from "react-router";
import User from "~/db/models/User";

// LOADER ========================================================= //
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  // Our session cookie is HTTPOnly, so we have to read it on the server and
  // return it to the client as loader data
  return { userId: session.get("userId") };
}

// COMPONENT ====================================================== //
export default function Login({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { userId } = loaderData;
  return (
    <div>
      <h1 className="mb-1 text-lg font-bold">Login</h1>
      {actionData?.errorMessage && (
        <p className="mb-3 rounded border border-red-500 bg-red-50 p-2 text-red-900">
          {actionData?.errorMessage}
        </p>
      )}
      {userId ? (
        <div>
          <p>
            You are already logged in as:
            <code className="ml-2 inline-block rounded bg-black p-2 text-white">
              {userId}
            </code>
          </p>
          <Form method="post" action="/logout">
            <Button>Logout</Button>
          </Form>
        </div>
      ) : (
        <Form method="post" reloadDocument>
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            name="username"
            id="username"
            placeholder="Username"
            required
            defaultValue={actionData?.values?.username}
          />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            required
            defaultValue={actionData?.values?.password}
          />
          <div className="flex flex-row items-center gap-3">
            <button type="submit" className="my-3 rounded border p-2">
              Login
            </button>
            <span className="italic">or</span>
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </Form>
      )}
    </div>
  );
}

// ACTION ========================================================= //
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const formDataObject = Object.fromEntries(formData) as {
    username: string;
    password: string;
  };

  // Check for valid input data ----------------------------------- //
  if (!formDataObject.username || !formDataObject.password) {
    return data(
      // Also return values so we can pre-populate the form
      {
        errorMessage: "Please provide a username and password",
        values: formDataObject,
      },
      { status: 400 },
    );
  }

  // Check that user exists ---------------------------------------- //
  const session = await getSession(request.headers.get("Cookie"));
  const user = await User.findOne(
    {
      username: formDataObject.username as string,
    },
    // Explicity include the password field because we have `select: false` in
    // the schema
    { username: 1, password: 1 },
  );
  if (!user) {
    return data(
      // Also return values so we can pre-populate the form
      { errorMessage: "User not found", values: formDataObject },
      { status: 404 },
    );
  }

  // Compare passwords --------------------------------------------- //
  const passwordIsValid = await bcrypt.compare(
    formDataObject.password as string,
    user.password,
  );
  if (!passwordIsValid) {
    return data(
      // Also return values so we can pre-populate the form
      { errorMessage: "Invalid password", values: formDataObject },
      { status: 401 },
    );
  }

  // Set session and redirect ------------------------------------- //
  // If the user exists and the password is valid, set the userId in the session...
  session.set("userId", user._id);
  // ...and go to the albums page, updating the session cookie in the process
  return redirect("/albums", {
    headers: {
      // Because we've set a value on the session, we need to commit it to the
      // session cookie
      "Set-Cookie": await commitSession(session),
    },
  });
}

// Components ----------------------------------------------------- //
function Button({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="mt-3 rounded bg-orange-600 p-2 text-white transition-colors hover:bg-orange-700"
    >
      {children}
    </button>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block font-semibold">
      {children}
    </label>
  );
}

function Input({
  name,
  id = name,
  type = "text",
  ...rest
}: {
  name: string;
  id?: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      name={name}
      id={id}
      className="mb-3 rounded border border-slate-200 p-2 bg-white"
      {...rest}
    />
  );
}

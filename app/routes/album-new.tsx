import { requireUserSession } from "~/session/session.server";
import type { Route } from "./+types/album-new";
import { data, Form, redirect } from "react-router";
import Album from "~/db/models/Album";

// LOADER ========================================================= //
export async function loader({ request }: Route.LoaderArgs) {
  // We require a user session here so users can't even see the album-creation
  // page without logging in.
  await requireUserSession(request);
}

// COMPONENT ====================================================== //
export default function CreateAlbum({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Create album</h1>
      <Form method="post">
        <label htmlFor="title" className="mb-1 block font-semibold">
          Title:
        </label>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Title"
          defaultValue={actionData?.values.title}
          className={[
            "rounded border border-orange-200 p-2 w-full",
            actionData?.errors.title ? "border-2 border-red-500" : "",
          ].join(" ")}
        />
        {actionData?.errors.title && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.title.message}
          </p>
        )}
        <label htmlFor="artist" className="mb-1 block font-semibold">
          Artist:
        </label>
        <input
          type="text"
          name="artist"
          id="artist"
          placeholder="Artist"
          defaultValue={actionData?.values.artist}
          className={[
            "rounded border border-orange-200 p-2 w-full",
            actionData?.errors.artist ? "border-2 border-red-500" : "",
          ].join(" ")}
        />
        {actionData?.errors.artist && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.artist.message}
          </p>
        )}
        <label htmlFor="year" className="mb-1 block font-semibold">
          Year:
        </label>
        <input
          type="text"
          name="year"
          id="year"
          placeholder="Year"
          defaultValue={actionData?.values.year}
          className={[
            "rounded border border-orange-200 p-2 w-full",
            actionData?.errors.year ? "border-2 border-red-500" : "",
          ].join(" ")}
        />
        {actionData?.errors.year && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.year.message}
          </p>
        )}
        <label htmlFor="runningTime" className="mb-1 block font-semibold">
          Running Time:
        </label>
        <input
          type="text"
          name="runningTime"
          id="runningTime"
          placeholder="Running time (in minutes)"
          defaultValue={actionData?.values.runningTime}
          className={[
            "rounded border border-orange-200 p-2 w-full",
            actionData?.errors.runningTime ? "border-2 border-red-500" : "",
          ].join(" ")}
        />
        {actionData?.errors.runningTime && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.runningTime.message}
          </p>
        )}
        <label htmlFor="tracks" className="mb-1 block font-semibold">
          Tracks:
        </label>
        <textarea
          name="tracks"
          id="tracks"
          rows={10}
          placeholder="Tracks (one per line)"
          defaultValue={actionData?.values.tracks}
          className={[
            "rounded border border-orange-200 p-2 w-full",
            actionData?.errors.tracks ? "border-2 border-red-500" : "",
          ].join(" ")}
        ></textarea>
        {actionData?.errors.tracks && (
          <p className="mb-0 mt-1 text-red-500">
            {actionData.errors.tracks.message}
          </p>
        )}
        <br />
        <button
          type="submit"
          className="mt-3 rounded bg-orange-600 p-2 text-white transition-colors hover:bg-orange-700"
        >
          Save
        </button>
      </Form>
    </div>
  );
}

// ACTION ========================================================= //
export async function action({ request }: Route.ActionArgs) {
  // We require a user session here so users can't actually create an album (by
  // POST'ing to this route) without logging in.
  const session = await requireUserSession(request);

  const form = await request.formData();
  try {
    const newAlbum = await Album.create({
      title: form.get("title"),
      artist: form.get("artist"),
      year: Number(form.get("year")),
      runningTime: Number(form.get("runningTime")),
      tracks: form.get("tracks")?.toString().split("\n"),
      user: session.get("userId"),
    });
    return redirect(`/albums/${newAlbum._id}`);
  } catch (error: Error | any) {
    return data(
      {
        errors: error.errors,
        values: Object.fromEntries(form) as {
          title?: string;
          artist?: string;
          year?: string;
          runningTime?: string;
          tracks?: string;
        },
      },
      { status: 400 },
    );
  }
}

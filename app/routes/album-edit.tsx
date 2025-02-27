import { requireUserSession } from "~/session/session.server";
import type { Route } from "./+types/album-edit";
import Album from "~/db/models/Album";
import { data, Form, redirect } from "react-router";

// LOADER ========================================================= //
export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await requireUserSession(request);
  const album = await Album.findById(params.albumId);
  if (!album) {
    throw new Response(`Couldn't find album with id ${params.albumId}`, {
      status: 404,
    });
  }
  if (album.user !== session.get("userId")) {
    throw new Response("That's not your album, my man", {
      status: 403,
    });
  }
  return { album };
}

// COMPONENT ====================================================== //
export default function EditAlbum({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { album } = loaderData;
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Edit album</h1>
      <Form method="post">
        <label htmlFor="title" className="mb-1 block font-semibold">
          Title:
        </label>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Title"
          defaultValue={album.title ?? actionData?.values.title}
          className={[
            "rounded border border-orange-200 w-full p-2",
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
          defaultValue={album.artist ?? actionData?.values.artist}
          className={[
            "rounded border border-orange-200 w-full p-2",
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
          defaultValue={album.year ?? actionData?.values.year}
          className={[
            "rounded border border-orange-200 w-full p-2",
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
          defaultValue={album.runningTime ?? actionData?.values.runningTime}
          className={[
            "rounded border border-orange-200 w-full p-2",
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
          defaultValue={album.tracks?.join("\n") ?? actionData?.values.tracks}
          className={[
            "rounded border border-orange-200 w-full p-2",
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
export async function action({ request, params }: Route.ActionArgs) {
  // We require a user session here so users can't actually edit an album (by
  // POST'ing to this route) without logging in.
  const session = await requireUserSession(request);
  const form = await request.formData();
  try {
    const album = await Album.findById(params.albumId);

    if (!album) {
      return new Response(`Couldn't find album with id ${params.albumId}`, {
        status: 404,
      });
    }

    if (album.user !== session.get("userId")) {
      return new Response("That's not your album, my man", {
        status: 403,
      });
    }

    album.title = form.get("title")?.toString() ?? "";
    album.artist = form.get("artist")?.toString() ?? "";
    album.year = Number(form.get("year"));
    album.runningTime = Number(form.get("runningTime"));
    album.tracks = form.get("tracks")?.toString().split("\n") ?? [];

    await album.save();

    return redirect(`/albums/${album._id}`);
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

import { requireUserSession } from "~/session/session.server";
import type { Route } from "./+types/album-new";
import { data, redirect } from "react-router";
import Album from "~/db/models/Album";
import AlbumForm from "~/components/AlbumForm";

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
      <AlbumForm
        defaultValues={actionData?.values || {}}
        errors={actionData?.errors || {}}
        submitLabel="Create"
      />
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

import { requireUserSession } from "~/session/session.server";
import type { Route } from "./+types/album-edit";
import Album from "~/db/models/Album";
import { data, redirect } from "react-router";
import AlbumForm from "~/components/AlbumForm";

// LOADER ========================================================= //
export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await requireUserSession(request);
  const album = await Album.findById(params.albumId).lean();
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

  // Use actionData values if available, otherwise use album data
  const defaultValues = actionData?.values || {
    title: album.title,
    artist: album.artist,
    year: album.year ?? undefined,
    runningTime: album.runningTime ?? undefined,
    tracks: album.tracks,
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Edit album</h1>
      <AlbumForm
        defaultValues={defaultValues}
        errors={actionData?.errors || {}}
      />
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

import { requireUserSession } from "~/session/session.server";
import type { Route } from "./+types/album-details";
import Album from "~/db/models/Album";
import { data, Form, Link, redirect } from "react-router";

export { ErrorBoundary } from "~/root";

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await requireUserSession(request);
  const album = await Album.findById(params.albumId).lean();
  if (!album) {
    throw data(`Couldn't find album with id ${params.albumId}`, {
      status: 404,
    });
  }
  if (album.user !== session.get("userId")) {
    throw data("That's not your album, my man", {
      status: 403,
    });
  }
  return { album };
}

export default function AlbumPage({ loaderData }: Route.ComponentProps) {
  const { album } = loaderData;
  return (
    <div>
      <div className="flex flex-row items-center gap-1">
        <h1 className="mb-4 flex-grow text-2xl font-bold">{album.title}</h1>
        <Link
          to="edit"
          className="rounded p-2 transition-colors hover:bg-amber-100"
        >
          ✏️
        </Link>
        <Form
          method="post"
          onSubmit={(e) => {
            if (!confirm("Are you sure you want to delete this album?")) {
              e.preventDefault();
            }
          }}
        >
          <button
            name="intent"
            value="delete"
            type="submit"
            className="rounded p-2 transition-colors hover:bg-amber-100"
          >
            🗑️
          </button>
        </Form>
      </div>
      <dl className="my-3">
        <dt className="my-1">Artist:</dt>
        <dd className="my-2 text-lg font-bold">{album.artist}</dd>
        <dt className="my-1">Released:</dt>
        <dd className="my-2 text-lg font-bold">{album.year}</dd>
        <dt className="my-1">Running time:</dt>
        <dd className="my-2 text-lg font-bold">
          {album.runningTime ? `${album.runningTime} minutes` : ""}
        </dd>
      </dl>
      <h2 className="my-3 border-t border-orange-200 pt-3 text-xl font-bold">
        Tracks
      </h2>
      <ol className="ml-5 list-decimal">
        {album.tracks?.map((track) => {
          return (
            <li key={track} className="my-2">
              {track}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await requireUserSession(request);
  const formData = await request.formData();
  const album = await Album.findById(params.albumId).lean();
  if (!album) {
    throw data(`Couldn't find album with id ${params.albumId}`, {
      status: 404,
    });
  }
  if (album.user !== session.get("userId")) {
    throw data("That's not your album, my man", { status: 403 });
  }
  if (formData.get("intent") === "delete") {
    await Album.findByIdAndDelete(params.albumId);
    return redirect("/albums");
  }
  return null;
}

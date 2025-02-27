import { Link, Outlet } from "react-router";
import { useState } from "react";
import Album from "~/db/models/Album";
import { requireUserSession } from "~/session/session.server";
import type { Route } from "./+types/albums";

// LOADER ========================================================= //
export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireUserSession(request);
  // Only show the albums that belong to the current user
  const albums = await Album.find({ user: session.get("userId") }).lean();
  return { albums };
}

// COMPONENT ====================================================== //
export default function Albums({ loaderData }: Route.ComponentProps) {
  const { albums } = loaderData;
  const [searchTerm, setSearchTerm] = useState("");

  let filteredAlbums = albums;
  const sanitizedSearchTerm = searchTerm.toLowerCase().trim();

  if (sanitizedSearchTerm) {
    filteredAlbums = albums.filter((album) => {
      return (
        album.title.toLowerCase().includes(sanitizedSearchTerm) ||
        album.artist.toLowerCase().includes(sanitizedSearchTerm)
      );
    });
  }

  return (
    <div className="gap-4 md:grid md:grid-cols-2">
      <div className="mb-5 border-orange-200 md:mb-0 md:mr-3 md:border-r md:pr-5">
        <h1 className="mb-4 text-2xl font-bold">My favorite albums</h1>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Filter by title or artist"
          className="mb-3 w-full rounded border border-orange-200 p-2"
        />
        <ul className="ml-5 list-disc">
          {filteredAlbums.map((album) => {
            return (
              <li key={album._id}>
                <Link
                  to={`/albums/${album._id}`}
                  className="text-orange-600 hover:underline"
                >
                  {album.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

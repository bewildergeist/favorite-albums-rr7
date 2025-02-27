import { redirect, Form, Link } from "react-router";
import Album from "~/db/models/Album";
import User from "~/db/models/User";
import seedAlbums from "~/db/seed/albums";
import seedUsers from "~/db/seed/users";
import type { Route } from "./+types/seed";

// LOADER ========================================================= //
export async function loader() {
  const dbUsersCount = await User.countDocuments();
  const dbAlbumsCount = await Album.countDocuments();
  const seedUsersCount = seedUsers.length;
  const seedAlbumsCount = seedAlbums.length;
  return {
    dbUsersCount,
    dbAlbumsCount,
    seedUsersCount,
    seedAlbumsCount,
  };
}

// COMPONENT ====================================================== //
export default function Seed({ loaderData }: Route.ComponentProps) {
  const { dbUsersCount, dbAlbumsCount, seedUsersCount, seedAlbumsCount } =
    loaderData;
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="rounded border-2 border-zinc-200 bg-zinc-50 p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
        <h1 className="mb-3 text-2xl font-bold">Seeding the database</h1>
        <p>
          You currently have <b>{dbUsersCount} users</b> and{" "}
          <b>{dbAlbumsCount}</b> albums in your database.
        </p>
        <p>
          Do you want to delete them and re-seed the database with{" "}
          <b>{seedUsersCount} users</b> and <b>{seedAlbumsCount} albums</b>?
        </p>
        <div className="mt-4 text-right">
          <Link
            to="/"
            className="mr-2 inline-block rounded bg-blue-700 px-3 py-1 font-bold text-white hover:bg-blue-800"
          >
            No
          </Link>
          <Form method="post" className="inline-block">
            <button
              type="submit"
              name="intent"
              value="seed"
              className="rounded bg-red-600 px-3 py-1 font-bold text-white hover:bg-red-700"
            >
              Yes
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}

// ACTION ========================================================= //
export async function action({ request }: Route.ActionArgs) {
  console.time("🌱 DB seeding");
  const formData = await request.formData();
  if (formData.get("intent") === "seed") {
    const { deletedCount: deletedAlbumCount } = await Album.deleteMany({});
    console.timeLog("🌱 DB seeding", `- Deleted ${deletedAlbumCount} albums`);
    const { deletedCount: deletedUserCount } = await User.deleteMany({});
    console.timeLog("🌱 DB seeding", `- Deleted ${deletedUserCount} users`);
    const users = await User.create(seedUsers);
    console.timeLog("🌱 DB seeding", `- Created ${users.length} users`);
    const ALBUMBS_PER_USER = 3;
    for (const user of users) {
      // Create a copy of seedAlbums and shuffle it
      const shuffledAlbums = [...seedAlbums].sort(() => Math.random() - 0.5);
      // Take the first three albums
      const selectedAlbums = shuffledAlbums.slice(0, ALBUMBS_PER_USER);
      // Create these three albums for the current user
      const albums = await Album.create(
        selectedAlbums.map((album) => ({ ...album, user: user._id })),
      );
      console.timeLog(
        "🌱 DB seeding",
        `- Created ${albums.length} albums for user ${user.username}`,
      );
    }
    console.timeEnd("🌱 DB seeding");
    return redirect("/");
  }
}

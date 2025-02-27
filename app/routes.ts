import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("albums", "routes/albums.tsx", [
    route(":albumId", "routes/album-details.tsx"),
  ]),
  route("login", "routes/login.tsx"),
  route("seed", "routes/seed.tsx"),
  route("logout", "routes/logout.ts"),
] satisfies RouteConfig;

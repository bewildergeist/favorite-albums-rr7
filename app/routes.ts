import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("seed", "routes/seed.tsx"),
] satisfies RouteConfig;

import { createServerFn } from "@tanstack/react-start";
import { listCenters } from "./store.server";
export const getPublicCenters = createServerFn({ method: "GET" }).handler(() => listCenters());

import { z } from "zod";

import { HomeViewSchema } from "./views.js";
import { bindNavbar } from "./utils.js";
import type { App } from "../app.js";

export async function renderHomeView(
  view: z.infer<typeof HomeViewSchema>,
  app: App,
): Promise<void> {
  app.appContainer.innerHTML = await fetch("/views/home.html").then((res) =>
    res.text(),
  );
  bindNavbar(app);
  void view;
}

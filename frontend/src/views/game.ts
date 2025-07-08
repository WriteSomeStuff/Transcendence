import { z } from "zod";

import { GameViewSchema } from "./views.js";
import { bindNavbar } from "./utils.js";
import type { App } from "../app.js";

export async function renderGameView(
  view: z.infer<typeof GameViewSchema>,
  app: App,
): Promise<void> {
  app.appContainer.innerHTML = await fetch("/views/pong.html").then((res) =>
    res.text(),
  );
  bindNavbar(app);
  void view;
}

import { z } from "zod";

import { ProfileViewSchema } from "./views.js";
import { bindNavbar } from "./utils.js";
import type { App } from "../app.js";

export async function renderProfileView(view: z.infer<typeof ProfileViewSchema>, app: App): Promise<void> {
  app.appContainer.innerHTML = await fetch("/views/profile.html").then((res) => res.text());
  bindNavbar(app);
  (void view);
}

import { z } from "zod";

import { DashboardViewSchema } from "./views.js";
import { bindNavbar } from "./utils.js";
import type { App } from "../app.js";

export async function renderDashboardView(view: z.infer<typeof DashboardViewSchema>, app: App): Promise<void> {
  app.appContainer.innerHTML = await fetch("/views/dashboard.html").then((res) => res.text());
  bindNavbar(app);
  (void view);
}

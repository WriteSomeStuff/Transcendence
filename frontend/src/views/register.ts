import { z } from "zod";

import { RegisterViewSchema } from "./views.js";
import { bindNavbar, formBindings, bindCredentialsForm } from "./utils.js";
import type { App } from "../app.js";

export async function renderRegisterView(
  view: z.infer<typeof RegisterViewSchema>,
  app: App,
): Promise<void> {
  app.appContainer.innerHTML = await fetch("/views/register.html").then((res) =>
    res.text(),
  );
  bindNavbar(app);
  bindCredentialsForm(formBindings["register"]!, app);
  void view;
}

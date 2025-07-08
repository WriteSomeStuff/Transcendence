import { z } from "zod";

import { LoginViewSchema } from "./views.js";
import { bindNavbar, formBindings, bindCredentialsForm } from "./utils.js";
import type { App } from "../app.js";

export async function renderLoginView(
  view: z.infer<typeof LoginViewSchema>,
  app: App,
): Promise<void> {
  app.appContainer.innerHTML = await fetch("/views/login.html").then((res) =>
    res.text(),
  );
  bindNavbar(app);
  bindCredentialsForm(formBindings["login"]!, app);
  void view;
}

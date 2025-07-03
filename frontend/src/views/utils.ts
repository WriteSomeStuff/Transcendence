import {ViewStateSchema} from "./views.js";
import type { App } from "../app.js"

export function bindNavbar(app: App) {
  app.appContainer.querySelectorAll("button[page]").forEach(button => {
    button.addEventListener("click", (event) => {
      const target: HTMLElement = event.currentTarget as HTMLElement;
      const page: string | null = target.getAttribute("page");
      console.log("page of a button", page);
      const view = ViewStateSchema.safeParse({ view: page, params: {} });
      console.log("view", view);
      if (view.success) {
        app.selectView(view.data);
      }
    });
  });
}

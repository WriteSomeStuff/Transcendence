import { z } from "zod";

import { LoginViewSchema } from "./views.js";
import { bindNavbar } from "./utils.js";
import type { App } from "../app.js";

type formBinding = { formId: string; url: string; serviceName: string };

function bindForm(formBinding: formBinding) {
  const form = document.getElementById(formBinding.formId) as HTMLFormElement | null;
  if (!form) {
    return;
  }

  form.addEventListener('submit', async function (event: Event) {
    event.preventDefault(); // prevents automatic reload and allows manual handling
    console.log("[FRONTEND] Handling login");

    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const response = await fetch(formBinding.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json() as { success: boolean, error?: string};

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP error; status: ${response.status}`);
      }

      console.log(`${formBinding.serviceName} successful: ${data}`);
      alert(`${formBinding.serviceName} successful!`);

      // TODO further handling, for registration to login page? for login to homepage?
    } catch (e) {
      console.error(`${formBinding.serviceName} failed: ${e}`);
      alert(`${formBinding.serviceName} failed: ${e}`);
      // TODO further handling
    }
  });
}

export async function renderLoginView(view: z.infer<typeof LoginViewSchema>, app: App): Promise<void> {
  app.appContainer.innerHTML = await fetch("/views/login.html").then((res) => res.text());
  bindNavbar(app);
  bindForm({ formId: 'loginForm',		url: '/auth/login',    serviceName: 'Login' });
  (void view);
}

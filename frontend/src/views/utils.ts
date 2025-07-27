import { ViewStateSchema } from "./views.js";
import type { App } from "../app.js";
import { bindVerify2FAForm, bindVerify2FAModal } from "./login.ts";

export function bindNavbar(app: App) {
  app.appContainer.querySelectorAll("button[page]").forEach((button) => {
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

export const formBindings: Record<
  string,
  { formId: string; url: string; serviceName: string }
> = {
  register: {
    formId: "registrationForm",
    url: "/api/auth/register",
    serviceName: "Registration",
  },
  login: {
    formId: "loginForm",
    url: "/api/auth/login",
    serviceName: "Login",
  },
};

type formBinding = { formId: string; url: string; serviceName: string };

export function bindCredentialsForm(formBinding: formBinding, app: App) {
  const form = document.getElementById(
    formBinding.formId,
  ) as HTMLFormElement | null;
  if (!form) {
    return;
  }

  form.addEventListener("submit", async function (event: Event) {
    event.preventDefault(); // prevents automatic reload and allows manual handling
    console.log("[FRONTEND] Handling login");

    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;
    const username = (document.getElementById("username") as HTMLInputElement)
      ?.value;

    try {
      const response = await fetch(formBinding.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
        twoFA?: boolean;
      };

      if (!response.ok || data.success === false) {
        throw new Error(data.error || `HTTP error; status: ${response.status}`);
      }

      if (formBinding.formId === "loginForm" && data.twoFA === true) {
        bindVerify2FAModal();
        bindVerify2FAForm(email, app);
        return;
      }

      console.log(`${formBinding.serviceName} successful: ${data}`);
      if (formBinding.formId === "registrationForm") {
        alert("Registration successful!");
        app.selectView({ view: "login", params: {} });
      } else {
        alert("Login successful!");
        app.resetView();
      }
    } catch (e) {
      console.error(`${formBinding.serviceName} failed: ${e}`);
      alert(`${formBinding.serviceName} failed: ${e}`);
      app.resetView();
    }
  });
}

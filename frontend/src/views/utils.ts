import { ViewStateSchema } from "./views.js";
import type { App } from "../app.js";

function bindVerify2FAModal() {
	const twoFAModal = document.getElementById('verify2FAModal') as HTMLDialogElement;
	const close2FAModal = document.getElementById('closeVerify2FAModal') as HTMLButtonElement;
	if (!twoFAModal) {
		throw new Error("2FA modal not found");
	}
	twoFAModal.showModal();
	if (close2FAModal) {
		close2FAModal.addEventListener('click', () => {
			twoFAModal.close();
		});
	}
}

function bindVerify2FAForm(username: string, app: App) {
	const form = document.getElementById('verify-2fa-form') as HTMLFormElement;
	if (!form) return;
	
	form.addEventListener('submit', async function (event: Event) {
		event.preventDefault();
		console.log("[formHandlers] Handling 2FA verification");

		const token = (document.getElementById('2fa-token') as HTMLInputElement).value;

		try {
			const response = await fetch('/api/auth/verify2fa', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ token, username })
			});

			const data = await response.json() as { success: boolean, error?: string };

			if (!response.ok || data.success === false) {
				throw new Error(data.error || `HTTP error; status: ${response.status}`);
			}

			console.log("[formHandlers] 2FA verification successful");
			alert("2FA verification successful!");

			app.resetView();
		} catch (e) {
			console.error("[formHandlers] 2FA verification failed:", e);
			alert(`2FA verification failed: ${e}`);
		}
	});
}

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
  login: { formId: "loginForm", url: "/api/auth/login", serviceName: "Login" },
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

    const username = (document.getElementById("username") as HTMLInputElement)
      .value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    try {
      const response = await fetch(formBinding.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
        twoFA?: boolean;
      };

      if (!response.ok || data.success === false) {
        throw new Error(data.error || `HTTP error; status: ${response.status}`);
      }

      if (formBinding.formId === 'loginForm' && data.twoFA === true) {
        bindVerify2FAModal();
        bindVerify2FAForm(username, app);
        return;
      }

      console.log(`${formBinding.serviceName} successful: ${data}`);
      if (formBinding.formId === "registrationForm") {
        app.selectView({ view: "login", params: {} });
      } else {
        app.resetView();
      }
    } catch (e) {
      console.error(`${formBinding.serviceName} failed: ${e}`);
      alert(`${formBinding.serviceName} failed: ${e}`);
      // TODO further handling
      app.resetView();
    }
  });
}

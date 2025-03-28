import type { App } from "./app.ts";
import { AppState } from "./app_state.ts";

export class Auth_state extends AppState {
  constructor(app: App) {
    super(app);
  }

  public isLoggedIn(): boolean {
    return !!localStorage.getItem("token"); // TODO add additional check with endpoint call
  }

  private renderLoginForm() {
    this.appContainer.innerHTML = `
            <h2>Login</h2>
            <form id="loginForm">
                <input type="text" id="username" placeholder="Username" required />
                <input type="password" id="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="#" id="registerLink">Register</a></p>
        `;

    document
      .getElementById("loginForm")
      ?.addEventListener("submit", (e) => this.handleLogin(e));
    document
      .getElementById("registerLink")
      ?.addEventListener("click", () => this.renderRegisterForm());
  }

  private renderRegisterForm() {
    this.appContainer.innerHTML = `
            <h2>Register</h2>
            <form id="registerForm">
                <input type="text" id="newUsername" placeholder="Username" required />
                <input type="password" id="newPassword" placeholder="Password" required />
                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <a href="#" id="loginLink">Login</a></p>
        `;

    document
      .getElementById("registerForm")
      ?.addEventListener("submit", (e) => this.handleRegister(e));
    document
      .getElementById("loginLink")
      ?.addEventListener("click", () => this.renderLoginForm());
  }

  private async handleLogin(event: Event) {
    event.preventDefault();
    const username = (document.getElementById("username") as HTMLInputElement)
      .value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        alert("Login failed.");
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      this.app.updateState();
    } catch (error) {
      alert("Login failed, try again.");
    }
  }

  private async handleRegister(event: Event) {
    event.preventDefault();
    const username = (
      document.getElementById("newUsername") as HTMLInputElement
    ).value;
    const password = (
      document.getElementById("newPassword") as HTMLInputElement
    ).value;

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        alert("Register failed.");
        return;
      }

      alert("Registration successful! Please log in.");
      this.renderLoginForm();
    } catch (error) {
      alert("Registration failed, please try again.");
    }
  }

  enterState(): void {
    this.renderLoginForm();
    console.log("Entering auth state");
  }

  exitState(): void {
    this.appContainer.innerHTML = '';
    console.log("Exiting auth state");
  }
}

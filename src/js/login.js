
import { loginUser, createApiKey } from "./api/auth.js";

const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");

/**
 * Displays feedback to the user.
 * @param {string} message - The message to display.
 * @param {string} type - The Bootstrap alert type.
 */
function showLoginMessage(message, type = "danger") {
  if (!loginMessage) {
    return;
  }

  loginMessage.textContent = message;
  loginMessage.className = `alert alert-${type}`;
}

/**
 * Handles the login form submission.
 * @param {SubmitEvent} event - The form submit event.
 */
async function handleLogin(event) {
  event.preventDefault();

  const submitButton = loginForm.querySelector(
    'button[type="submit"]',
  );

  const originalButtonText = submitButton?.textContent;

  if (submitButton?.disabled) {
    return;
  }

  loginMessage.textContent = "";
  loginMessage.className = "mb-3";

  const formData = new FormData(loginForm);

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    showLoginMessage("Please enter your email and password.");
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";
  }

  try {
    const user = await loginUser(email, password);

    const apiKey = await createApiKey(user.accessToken);

    localStorage.setItem("accessToken", user.accessToken);
    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("name", user.name);
    localStorage.setItem("email", user.email);

    showLoginMessage("Login successful!", "success");

    setTimeout(() => {
      window.location.href = "./index.html";
    }, 1000);
  } catch (error) {
    console.error("Login failed:", error);

    showLoginMessage(
      error.message || "Could not log in. Please try again.",
    );

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}

if (loginForm && loginMessage) {
  loginMessage.setAttribute("aria-live", "polite");

  loginForm.addEventListener("submit", handleLogin);
}

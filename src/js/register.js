
import { registerUser } from "./api/auth.js";

const registerForm = document.querySelector("#registerForm");
const registerMessage = document.querySelector("#registerMessage");

/**
 * Displays registration feedback to the user.
 * @param {string} message - The message to display.
 * @param {string} type - The Bootstrap alert type.
 */
function showRegisterMessage(message, type = "danger") {
  if (!registerMessage) {
    return;
  }

  registerMessage.textContent = message;
  registerMessage.className = `alert alert-${type}`;
}

/**
 * Handles the registration form submission.
 * @param {SubmitEvent} event - The form submit event.
 */
async function handleRegister(event) {
  event.preventDefault();

  const submitButton = registerForm.querySelector(
    'button[type="submit"]',
  );

  if (submitButton?.disabled) {
    return;
  }

  const originalButtonText = submitButton?.textContent;

  registerMessage.textContent = "";
  registerMessage.className = "mb-3";

  const formData = new FormData(registerForm);

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  // Check that all required fields have been filled in.
  if (!name || !email || !password) {
    showRegisterMessage("Please fill in all fields.");
    return;
  }

  // Only Noroff student email addresses can register.
  if (!email.toLowerCase().endsWith("@stud.noroff.no")) {
    showRegisterMessage(
      "Please use your @stud.noroff.no email.",
    );
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";
  }

  try {
    await registerUser(name, email, password);

    showRegisterMessage(
      "Account created! Redirecting to login...",
      "success",
    );

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1500);
  } catch (error) {
    console.error("Registration failed:", error);

    showRegisterMessage(
      error.message || "Could not create account. Please try again.",
    );

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}

if (registerForm && registerMessage) {
  registerMessage.setAttribute("aria-live", "polite");

  registerForm.addEventListener("submit", handleRegister);
}

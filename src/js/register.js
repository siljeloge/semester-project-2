import { registerUser } from "./api/auth.js";

const registerForm = document.querySelector("#registerForm");
const registerMessage = document.querySelector("#registerMessage");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  registerMessage.textContent = "";
  registerMessage.className = "mb-3";

  const formData = new FormData(registerForm);

  const name = formData.get("name").trim();
  const email = formData.get("email").trim();
  const password = formData.get("password");

  if (!email.endsWith("@stud.noroff.no")) {
    registerMessage.textContent =
      "Please use your @stud.noroff.no email.";
    registerMessage.className = "alert alert-danger";

    return;
  }

  try {
    await registerUser(name, email, password);

    registerMessage.textContent =
      "Account created! Redirecting to login...";
    registerMessage.className = "alert alert-success";

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1500);
  } catch (error) {
    registerMessage.textContent = error.message;
    registerMessage.className = "alert alert-danger";
  }
});
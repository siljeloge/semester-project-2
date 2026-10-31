import { loginUser, createApiKey } from "./api/auth.js";

const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.textContent = "";
  loginMessage.className = "mb-3";

  const formData = new FormData(loginForm);

  const email = formData.get("email").trim();
  const password = formData.get("password");

  try {
    const user = await loginUser(email, password);

    const apiKey = await createApiKey(user.accessToken);

    localStorage.setItem("accessToken", user.accessToken);
    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("name", user.name);
    localStorage.setItem("email", user.email);

    loginMessage.textContent = "Login successful!";
    loginMessage.className = "alert alert-success";

    setTimeout(() => {
      window.location.href = "./index.html";
    }, 1000);
  } catch (error) {
    console.error(error);

    loginMessage.textContent = error.message;
    loginMessage.className = "alert alert-danger";
  }
});
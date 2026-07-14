// Année automatique dans le footer
const yearElements = document.querySelectorAll("[data-current-year]");

yearElements.forEach((element) => {
  element.textContent = new Date().getFullYear();
});

// Accordéons
const accordionButtons = document.querySelectorAll(".accordion__button");

accordionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".accordion__item");

    if (!item) {
      return;
    }

    const isOpen = item.classList.toggle("is-open");

    button.setAttribute("aria-expanded", String(isOpen));

    const icon = button.querySelector(".accordion__icon");

    if (icon) {
      icon.textContent = isOpen ? "−" : "+";
    }
  });
});

// Fermer les accordéons avec la touche Échap
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  document
    .querySelectorAll(".accordion__item.is-open")
    .forEach((item) => {
      item.classList.remove("is-open");

      const button = item.querySelector(".accordion__button");
      const icon = item.querySelector(".accordion__icon");

      button?.setAttribute("aria-expanded", "false");

      if (icon) {
        icon.textContent = "+";
      }
    });
});

// Empêche les formulaires provisoires de se soumettre
const previewForms = document.querySelectorAll("[data-preview-form]");

previewForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = form.querySelector("[data-form-message]");

    if (message) {
      message.textContent =
        "Le formulaire sera prochainement relié au service définitif.";
    }
  });
});

// Store the instant the form first loads, rather than the submission time.
const timestamp = document.querySelector("#timestamp");
if (timestamp) timestamp.value = new Date().toISOString();

// Native <dialog> supports Escape, focus management, and keyboard interaction.
document.querySelectorAll("[data-dialog]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    const dialog = document.getElementById(link.dataset.dialog);
    if (dialog) dialog.showModal();
  });
});

document.querySelectorAll(".membership-dialog").forEach(dialog => {
  const closeButton = dialog.querySelector(".dialog-close");
  closeButton.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
});

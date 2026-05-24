document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("xss-title");

  if (!title) return;

  let currentScale = 1;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const targetScale = Math.max(0.6, 1 - scrollY / 700);

    currentScale += (targetScale - currentScale) * 0.1;
    title.style.transform = `scale(${currentScale})`;
  });
});

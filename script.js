document.addEventListener("DOMContentLoaded", () => {

const buttons = document.querySelectorAll('.theme-toggle, .theme-toggle-float');

buttons.forEach(btn => {
btn.addEventListener('click', () => {
const html = document.documentElement;
const current = html.getAttribute("data-theme");

```
  const newTheme = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);

  localStorage.setItem("theme", newTheme);
});
```

});

// cargar tema guardado
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
document.documentElement.setAttribute("data-theme", savedTheme);
}

});

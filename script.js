const toggleButtons = document.querySelectorAll('.theme-toggle, .theme-toggle-float');

toggleButtons.forEach(btn => {
btn.addEventListener('click', () => {
const currentTheme = document.documentElement.getAttribute('data-theme');
const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

```
document.documentElement.setAttribute('data-theme', newTheme);
localStorage.setItem('theme', newTheme);
```

});
});

// Cargar tema guardado
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
document.documentElement.setAttribute('data-theme', savedTheme);
}

document.querySelectorAll('.portal-theme').forEach(button => {
  function updateState() {
    const dark = document.body.classList.contains('dark');
    button.setAttribute('aria-pressed', String(dark));
    button.title = dark ? '切换到浅色主题' : '切换到深色主题';
  }

  updateState();
  button.addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark');
    try { localStorage.setItem('miyabi-theme', dark ? 'dark' : 'light'); } catch {}
    updateState();
  });
});

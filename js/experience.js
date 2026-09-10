(() => {
  const body = document.body;
  const trigger = document.querySelector('.menu-trigger');
  const menu = document.getElementById('fi-menu');
  const shade = document.querySelector('.menu-shade');

  const closeMenu = () => {
    body.classList.remove('menu-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    body.classList.add('menu-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  };

  if (trigger && menu) {
    trigger.addEventListener('click', () => {
      body.classList.contains('menu-open') ? closeMenu() : openMenu();
    });
  }
  if (shade) shade.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  document.querySelectorAll('#fi-menu a').forEach((link) => link.addEventListener('click', closeMenu));

  const animated = document.querySelectorAll('[data-magic]');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const effect = el.dataset.magic || 'spaceInUp';
        el.classList.add('is-visible', 'magictime', effect);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px' });
    animated.forEach((el) => observer.observe(el));
  } else {
    animated.forEach((el) => el.classList.add('is-visible'));
  }
})();

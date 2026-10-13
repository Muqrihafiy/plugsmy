const current = location.pathname.split('/').pop();
document.querySelectorAll('.micro-header nav a').forEach(link => {
  if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
});
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    document.querySelectorAll('[data-category]').forEach(item => {
      item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter;
    });
  });
});
const photoDialog = document.querySelector('.photo-dialog');
if (photoDialog) {
  document.querySelectorAll('.photo-open').forEach(button => {
    button.addEventListener('click', () => {
      const image = button.querySelector('img');
      const display = photoDialog.querySelector('img');
      display.src = image.src;
      display.alt = image.alt;
      photoDialog.querySelector('p').textContent = button.closest('figure').querySelector('figcaption span').textContent;
      photoDialog.showModal();
    });
  });
  photoDialog.querySelector('.photo-close').addEventListener('click', () => photoDialog.close());
  photoDialog.addEventListener('click', event => {
    if (event.target === photoDialog) {
      const bounds = photoDialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) photoDialog.close();
    }
  });
}
const carousel = document.querySelector('.hero-carousel');
if (carousel) {
  const slides = [...carousel.querySelectorAll('.hero-slide')];
  const tabs = [...carousel.querySelectorAll('[data-slide]')];
  let activeSlide = 0;
  const toggle = carousel.querySelector('.carousel-toggle');
  const status = carousel.querySelector('.carousel-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let hovered = false;
  let focused = false;
  let timer;
  function updatePlayback() {
    clearInterval(timer);
    const playing = !paused && !hovered && !focused && !document.hidden;
    status.setAttribute('aria-live', playing ? 'off' : 'polite');
    toggle.textContent = paused ? '▶ Play' : 'Ⅱ Pause';
    toggle.setAttribute('aria-label', paused ? 'Start automatic slideshow' : 'Pause automatic slideshow');
    if (playing) timer = setInterval(() => showSlide(activeSlide + 1), 5000);
  }
  toggle.addEventListener('click', () => { paused = !paused; updatePlayback(); });
  carousel.addEventListener('mouseenter', () => { hovered = true; updatePlayback(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; updatePlayback(); });
  carousel.addEventListener('focusin', () => { focused = true; updatePlayback(); });
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) { focused = false; updatePlayback(); }
  });
  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updatePlayback(); });
  function showSlide(index) {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== activeSlide; });
    tabs.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === activeSlide)));
    carousel.querySelector('.carousel-status').textContent = `${tabs[activeSlide].textContent} — ${activeSlide + 1} of ${slides.length}`;
  }
  tabs.forEach((tab, i) => tab.addEventListener('click', () => showSlide(i)));
  carousel.querySelector('.carousel-prev').addEventListener('click', () => showSlide(activeSlide - 1));
  carousel.querySelector('.carousel-next').addEventListener('click', () => showSlide(activeSlide + 1));
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showSlide(activeSlide + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  updatePlayback();
}
const assembly = document.querySelector('.pc-assembly');
if (assembly) {
  const button = assembly.querySelector('.assembly-toggle');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotion = () => { button.hidden = motion.matches; };
  syncMotion();
  motion.addEventListener('change', syncMotion);
  button.addEventListener('click', () => {
    const paused = assembly.classList.toggle('is-paused');
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Play computer assembly animation' : 'Pause computer assembly animation');
    button.textContent = paused ? '▶ Play' : 'Ⅱ Pause';
  });
}

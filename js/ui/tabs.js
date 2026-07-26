// ui/tabs.js — Sistema de pestañas modular

export function initTabs() {
  const tabBtns = document.querySelectorAll('[data-tab]');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cambiarPestana(btn.getAttribute('data-tab'));
    });
  });
}

export function cambiarPestana(nombre) {
  const botones = document.querySelectorAll('[data-tab]');
  botones.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === nombre);
  });
  const paneles = document.querySelectorAll('[data-panel]');
  paneles.forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-panel') === nombre);
  });
}

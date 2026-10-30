const $ = selector => document.querySelector(selector);
const nav = [...document.querySelectorAll('#nav a')];
const searchInput = $('#search');
const menu = $('#menu');
const sidebar = $('#sidebar');
let filter = 'all';

function writeSnippet(link, target, query) {
  link.querySelector('.nav-match')?.remove();
  if (!query || link.hidden) return;

  const text = target.textContent.replace(/\s+/g, ' ').trim();
  const index = text.toLowerCase().indexOf(query);
  if (index < 0) return;

  const start = Math.max(0, index - 14);
  const end = Math.min(text.length, index + query.length + 28);
  const snippet = document.createElement('small');
  snippet.className = 'nav-match';
  if (start > 0) snippet.append('…');
  snippet.append(text.slice(start, index));
  const mark = document.createElement('mark');
  mark.textContent = text.slice(index, index + query.length);
  snippet.append(mark, text.slice(index + query.length, end));
  if (end < text.length) snippet.append('…');
  link.append(snippet);
}

function search() {
  const query = searchInput.value.trim().toLowerCase();
  let count = 0;

  nav.forEach(link => {
    const target = document.querySelector(link.hash);
    const matchesQuery = !query || target.textContent.toLowerCase().includes(query);
    const matchesFilter = filter === 'all' || link.dataset.tag === filter;
    link.hidden = !(matchesQuery && matchesFilter);
    if (!link.hidden) count++;
    writeSnippet(link, target, query);
  });

  $('#count').textContent = String(count).padStart(2, '0');
  $('#empty').hidden = count > 0;
}

searchInput.addEventListener('input', search);
searchInput.addEventListener('keydown', event => {
  if (event.key !== 'Enter') return;
  const firstMatch = nav.find(link => !link.hidden);
  if (!firstMatch) return;
  firstMatch.click();
  if (matchMedia('(min-width: 851px)').matches) firstMatch.focus();
});

document.querySelectorAll('[data-filter]').forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('selected')));
  button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    search();
  });
});

const backdrop = document.createElement('button');
backdrop.type = 'button';
backdrop.className = 'sidebar-backdrop';
backdrop.setAttribute('aria-label', '关闭目录');
backdrop.hidden = true;
document.body.append(backdrop);

function openMenu() {
  sidebar.classList.add('open');
  menu.setAttribute('aria-expanded', 'true');
  backdrop.hidden = false;
  document.body.classList.add('nav-open');
  searchInput.focus();
}

function closeMenu(restoreFocus = false) {
  const wasOpen = sidebar.classList.contains('open');
  sidebar.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  backdrop.hidden = true;
  document.body.classList.remove('nav-open');
  if (wasOpen && restoreFocus) menu.focus();
}

menu.addEventListener('click', () => {
  if (sidebar.classList.contains('open')) closeMenu();
  else openMenu();
});
backdrop.addEventListener('click', () => closeMenu(true));
document.querySelector('main').addEventListener('click', () => closeMenu());
matchMedia('(min-width: 851px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

document.addEventListener('keydown', event => {
  const tag = event.target.tagName;
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && !event.target.isContentEditable) {
    event.preventDefault();
    openMenu();
  }
  if (event.key === 'Escape') closeMenu(true);
});

nav.forEach(link => link.addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    const target = document.querySelector(link.hash);
    target.querySelectorAll('details').forEach(details => {
      if (details.textContent.toLowerCase().includes(query)) details.open = true;
    });
  }
  closeMenu();
}));

// Open a linked disclosure before the browser scrolls to it.
function revealLinkedDetails(hash) {
  if (!hash || hash === '#') return;
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  const details = target.closest('details');
  if (details) details.open = true;
}
document.querySelectorAll('.section-nav a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => revealLinkedDetails(link.hash));
});
window.addEventListener('hashchange', () => revealLinkedDetails(location.hash));
revealLinkedDetails(location.hash);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      nav.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-12% 0px -65% 0px', threshold: 0 });
document.querySelectorAll('[data-entry]').forEach(section => observer.observe(section));

const skins = {
  default: {
    name: '默认衣装',
    image: 'assets/default.png',
    description: '深色衣装与长发，保留标志性的发卡、袖饰和高跟鞋。'
  },
  alt: {
    name: '银庭花信',
    image: 'assets/alt.png',
    description: '花饰、辫子与后丝带，搭配银庭衣装、米白短袜与高跟鞋饰。'
  },
  dawn: {
    name: '晓',
    image: 'assets/dawn.png',
    description: '就像黎明即将来临。浅色衣装、白裤袜与小白鞋，渔夫帽和围巾需作为独立装备穿戴。'
  }
};

document.querySelectorAll('[data-skin]').forEach(button => button.addEventListener('click', () => {
  const skin = skins[button.dataset.skin];
  document.querySelectorAll('[data-skin]').forEach(item => {
    item.setAttribute('aria-selected', String(item === button));
  });
  $('#skin-art').src = skin.image;
  $('#skin-art').alt = `${skin.name}衣柜简笔画`;
  $('#skin-name').textContent = skin.name;
  $('#skin-desc').textContent = skin.description;
}));

function updateThemeButton() {
  const dark = document.body.classList.contains('dark');
  $('#theme').setAttribute('aria-pressed', String(dark));
  $('#theme').title = dark ? '切换到浅色主题' : '切换到深色主题';
}
updateThemeButton();
$('#theme').addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark');
  try { localStorage.setItem('miyabi-theme', dark ? 'dark' : 'light'); } catch {}
  updateThemeButton();
});

let toastTimer;
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2400);
}
$('#copy')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('1131834002');
    toast('群号已复制：1131834002');
  } catch {
    toast('群号：1131834002，可长按或选中复制');
  }
});

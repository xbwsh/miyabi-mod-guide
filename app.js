const $ = selector => document.querySelector(selector);
const nav = [...document.querySelectorAll('#nav a')];
const searchInput = $('#search');
const menu = $('#menu');
const sidebar = $('#sidebar');
let filter = 'all';

// Each existing section remains the source of truth, including its old anchors.
const entryMode = document.body.dataset.entries === 'true';
const entrySections = entryMode ? nav.map(link => document.querySelector(link.hash)).filter(Boolean) : [];
const entryIcons = {
  overview: 'default.png', combat: 'blade.png', wuwei: 'blade.png', pack: 'pack.png',
  hairclip: 'hairclip.png', 'dawn-hat': 'dawn-hat.png', 'dawn-scarf': 'dawn-scarf.png',
  'dawn-bag': 'dawn-bag.png', companion: 'xiaowuwei.webp', wardrobe: 'dawn.png',
  core: 'zzz-modicon.png', profile: 'avatar.png', anomaly: 'anomaly-component.png',
  drive: 'drive-disc.png', materials: 'resonance-core.png', yunkui: 'ether-battery.png',
  'record-shop': 'recordshop.png', chips: 'anomaly-component.png', crate: 'crate.png',
  'bangboo-nest': 'bangboo-nest.png', sharkboo: 'sharkboo.png', beacon: 'beacon.png'
};
const relatedEntries = {
  overview: ['combat', 'wuwei', 'pack', 'hairclip'], combat: ['wuwei', 'pack'],
  wuwei: ['combat', 'pack', 'hairclip'], pack: ['combat', 'wuwei'],
  hairclip: ['dawn-hat', 'dawn-scarf', 'dawn-bag'], 'dawn-hat': ['hairclip', 'dawn-scarf', 'dawn-bag'],
  'dawn-scarf': ['dawn-hat', 'dawn-bag', 'hairclip'], 'dawn-bag': ['dawn-hat', 'dawn-scarf'],
  core: ['profile', 'drive', 'record-shop', 'bangboo-nest'], profile: ['drive', 'anomaly'],
  anomaly: ['profile', 'drive'], drive: ['profile', 'record-shop', 'materials'],
  materials: ['drive', 'record-shop', 'yunkui'], yunkui: ['materials', 'record-shop'],
  'record-shop': ['drive', 'materials', 'chips'], chips: ['record-shop', 'crate'],
  crate: ['chips', 'beacon'], 'bangboo-nest': ['sharkboo', 'beacon'],
  sharkboo: ['bangboo-nest', 'beacon'], beacon: ['bangboo-nest', 'crate']
};
let selectedEntry;
if (entryMode) {
  document.body.classList.add('entry-mode');
  document.querySelector('.nav-caption').firstChild.textContent = '词条导航 ';
  nav.forEach(link => {
    const icon = entryIcons[link.hash.slice(1)];
    if (!icon) return;
    const image = document.createElement('img');
    image.src = `assets/${icon}`;
    image.alt = '';
    image.className = 'nav-entry-icon';
    link.prepend(image);
  });
  const related = document.createElement('aside');
  related.className = 'related-entries';
  related.setAttribute('aria-label', '关联词条');
  document.querySelector('main').append(related);
  const extras = [
    [document.querySelector('.stats'), 'overview'],
    [document.querySelector('.particle-gallery'), 'guide'],
    [document.getElementById('core') && document.querySelector('.entries > details'), 'core']
  ].filter(([element]) => element);
  function selectEntry() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ''; }
    const target = id && document.getElementById(id);
    const extraOwner = target && extras.find(([element]) => element === target || element.contains(target));
    const section = entrySections.find(item => item === target || (target && item.contains(target))) ||
      (extraOwner && entrySections.find(item => item.id === extraOwner[1])) || entrySections[0];
    const changed = selectedEntry !== section;
    selectedEntry = section;
    entrySections.forEach(item => { item.hidden = item !== section; });
    extras.forEach(([element, owner]) => { element.hidden = section.id !== owner; });
    nav.forEach(link => {
      const active = link.hash === `#${section.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    related.replaceChildren();
    const links = (relatedEntries[section.id] || []).map(key => nav.find(link => link.hash === `#${key}`)).filter(Boolean);
    related.hidden = !links.length;
    if (links.length) {
      const title = document.createElement('h2');
      title.textContent = '关联词条';
      related.append(title);
      links.forEach(link => {
        const item = link.cloneNode(true);
        item.removeAttribute('aria-current');
        item.classList.remove('active');
        item.querySelector('.nav-match')?.remove();
        related.append(item);
      });
    }
    revealLinkedDetails(location.hash);
    if (target && (changed || target !== section)) requestAnimationFrame(() => target.scrollIntoView());
  }
  window.addEventListener('hashchange', selectEntry);
  // Runs after the disclosure helper is initialized below.
  window.addEventListener('DOMContentLoaded', selectEntry, { once: true });
}

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

  $('#count').textContent = String(count);
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
  if (matchMedia('(min-width: 851px)').matches) {
    searchInput.focus();
    return;
  }
  sidebar.classList.add('open');
  menu.setAttribute('aria-expanded', 'true');
  backdrop.hidden = false;
  document.body.classList.add('nav-open');
  document.querySelector('.page').inert = true;
  searchInput.focus();
}

function closeMenu(restoreFocus = false) {
  const wasOpen = sidebar.classList.contains('open');
  sidebar.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  backdrop.hidden = true;
  document.body.classList.remove('nav-open');
  document.querySelector('.page').inert = false;
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
  if (event.key === 'Tab' && sidebar.classList.contains('open')) {
    const controls = [...sidebar.querySelectorAll('a, button, input')].filter(item => item.getClientRects().length && !item.hidden);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
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
  let details = target.closest('details');
  while (details) {
    details.open = true;
    details = details.parentElement?.closest('details');
  }
}
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => revealLinkedDetails(link.hash));
});
window.addEventListener('hashchange', () => revealLinkedDetails(location.hash));
revealLinkedDetails(location.hash);

// Use document order so short final sections can become active at the bottom.
const sections = nav.map(link => document.querySelector(link.hash)).filter(Boolean);
function updateActiveSection() {
  if (!sections.length || entryMode) return;
  const scrollRoot = document.scrollingElement;
  const atBottom = scrollRoot.scrollHeight > scrollRoot.clientHeight &&
    scrollRoot.scrollTop + scrollRoot.clientHeight >= scrollRoot.scrollHeight - 2;
  let active = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= window.innerHeight * 0.12) active = section;
  }
  const last = sections[sections.length - 1];
  if (atBottom && last.getBoundingClientRect().top < window.innerHeight) active = last;
  nav.forEach(link => {
    const selected = link.hash === `#${active.id}`;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
let scrollUpdatePending = false;
function scheduleActiveSectionUpdate() {
  if (scrollUpdatePending) return;
  scrollUpdatePending = true;
  requestAnimationFrame(() => {
    scrollUpdatePending = false;
    updateActiveSection();
  });
}
window.addEventListener('scroll', scheduleActiveSectionUpdate, { passive: true });
window.addEventListener('resize', scheduleActiveSectionUpdate);
updateActiveSection();

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
    description: '浅色衣装、白裤袜与小白鞋，渔夫帽和围巾需作为独立装备穿戴。'
  }
};

document.querySelectorAll('[data-skin]').forEach(button => button.addEventListener('click', () => {
  const skin = skins[button.dataset.skin];
  document.querySelectorAll('[data-skin]').forEach(item => {
    item.setAttribute('aria-selected', String(item === button));
    item.tabIndex = item === button ? 0 : -1;
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

search();

// Native tab keys keep the wardrobe usable without a pointer.
const skinButtons = [...document.querySelectorAll('[data-skin]')];
skinButtons.forEach((button, index) => {
  button.tabIndex = button.getAttribute('aria-selected') === 'true' ? 0 : -1;
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % skinButtons.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + skinButtons.length) % skinButtons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = skinButtons.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    skinButtons[next].click();
    skinButtons[next].focus();
  });
});

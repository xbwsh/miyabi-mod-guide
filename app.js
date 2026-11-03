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

function openMenu(focusSearch = false) {
  if (matchMedia('(min-width: 851px)').matches) {
    searchInput.focus();
    return;
  }
  sidebar.classList.add('open');
  menu.setAttribute('aria-expanded', 'true');
  backdrop.hidden = false;
  document.body.classList.add('nav-open');
  document.querySelector('.page').inert = true;
  (focusSearch ? searchInput : sidebar.querySelector('a, button')).focus();
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
    openMenu(true);
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
  if (!sections.length) return;
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

// Build the cross-page index from the published handbooks, so their text remains
// the single source for both reading and search.
const globalDialog = $('#global-search-dialog');
const globalTrigger = $('#global-search-open');
const globalInput = $('#global-search-input');
const globalStatus = $('#global-search-status');
const globalResults = $('#global-search-results');
if (globalDialog && globalTrigger && globalInput && globalStatus && globalResults) {
  const globalSources = [
    { path: 'miyabi.html', name: '星见雅' },
    { path: 'zzz.html', name: '绝区零模组' }
  ];
  let globalIndexPromise;
  let globalRequest = 0;
  let searchReturnFocus;

  function cleanSearchText(value) {
    return value.replace(/\s+/g, ' ').trim();
  }

  function globalSearchIndex() {
    if (!globalIndexPromise) {
      globalIndexPromise = Promise.all(globalSources.map(async source => {
        const response = await fetch(source.path);
        if (!response.ok) throw new Error('Search index unavailable');
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const entries = [];
        doc.querySelectorAll('#nav a[href^="#"]').forEach(link => {
          const hash = link.getAttribute('href');
          const target = doc.getElementById(hash.slice(1));
          if (!target) return;
          const title = cleanSearchText(link.textContent);
          let content = target.textContent;
          if (hash === '#overview') content += ` ${doc.querySelector('.stats')?.textContent || ''}`;
          entries.push({ page: source.name, href: source.path + hash, title, text: cleanSearchText(content) });
          target.querySelectorAll('details[id]').forEach(details => {
            const summary = details.querySelector('summary');
            if (!summary) return;
            const subtitle = cleanSearchText(summary.textContent).replace(/\s*\+\s*$/, '');
            entries.push({ page: source.name, href: `${source.path}#${details.id}`,
              title: `${title} · ${subtitle}`, text: cleanSearchText(details.textContent) });
          });
        });
        return entries;
      })).then(groups => groups.flat()).catch(error => {
        globalIndexPromise = undefined;
        throw error;
      });
    }
    return globalIndexPromise;
  }

  function searchExcerpt(text, terms) {
    const lower = text.toLowerCase();
    const match = terms.map(term => lower.indexOf(term)).find(index => index >= 0) ?? 0;
    const start = Math.max(0, match - 14);
    const end = Math.min(text.length, Math.max(start + 76, match + terms[0].length + 28));
    return `${start ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
  }

  async function searchAll() {
    const request = ++globalRequest;
    const query = cleanSearchText(globalInput.value).toLowerCase();
    globalResults.replaceChildren();
    if (!query) {
      globalStatus.textContent = '输入关键词开始搜索。';
      return;
    }
    globalStatus.textContent = '正在查找资料…';
    try {
      const entries = await globalSearchIndex();
      if (request !== globalRequest || !globalDialog.open) return;
      const terms = query.split(/\s+/).filter(Boolean);
      const matches = entries.map((entry, order) => {
        const title = entry.title.toLowerCase();
        const content = `${title} ${entry.text.toLowerCase()}`;
        return { entry, order, matches: terms.every(term => content.includes(term)),
          score: terms.reduce((score, term) => score + (title.includes(term) ? 1 : 0), 0) };
      }).filter(result => result.matches).sort((a, b) => b.score - a.score || a.order - b.order);
      globalStatus.textContent = matches.length
        ? `找到 ${matches.length} 处相关内容${matches.length > 16 ? '，显示前 16 处' : ''}。`
        : '没有找到相关内容，试试其他关键词。';
      matches.slice(0, 16).forEach(({ entry }) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = entry.href;
        link.setAttribute('aria-label', `${entry.title}，${entry.page}`);
        const heading = document.createElement('span');
        heading.className = 'global-result-heading';
        const title = document.createElement('strong');
        title.textContent = entry.title;
        const page = document.createElement('span');
        page.className = 'global-result-page';
        page.textContent = entry.page;
        const excerpt = document.createElement('small');
        excerpt.textContent = searchExcerpt(entry.text, terms);
        heading.append(title, page);
        link.append(heading, excerpt);
        item.append(link);
        globalResults.append(item);
      });
    } catch {
      if (request === globalRequest && globalDialog.open) {
        globalStatus.textContent = '资料暂时无法加载，请稍后重试或使用左侧本页搜索。';
      }
    }
  }

  function openGlobalSearch() {
    if (globalDialog.open) return;
    searchReturnFocus = sidebar.classList.contains('open') ? menu : document.activeElement;
    closeMenu();
    globalInput.value = '';
    globalResults.replaceChildren();
    globalStatus.textContent = '输入关键词开始搜索。';
    globalDialog.showModal();
    globalInput.focus();
  }
  globalTrigger.addEventListener('click', openGlobalSearch);
  globalInput.addEventListener('input', searchAll);
  globalInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      const first = globalResults.querySelector('a');
      if (first) { event.preventDefault(); first.click(); }
    }
  });
  globalResults.addEventListener('click', event => {
    if (event.target.closest('a')) globalDialog.close();
  });
  globalDialog.addEventListener('click', event => {
    if (event.target === globalDialog) globalDialog.close();
  });
  globalDialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      globalDialog.close();
    }
  });
  globalDialog.addEventListener('close', () => {
    globalRequest++;
    if (searchReturnFocus?.isConnected) searchReturnFocus.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openGlobalSearch();
    }
  });
}

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

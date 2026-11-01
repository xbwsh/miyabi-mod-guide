"""Dependency-free checks for the static manual; run from any working directory."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.refs, self.stack, self.errors = [], [], [], []
        self.h1 = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'h1':
            self.h1 += 1
        for key in ('href', 'src', 'data-still', 'data-motion', 'data-image', 'aria-labelledby', 'aria-controls'):
            if key in attrs:
                self.refs.extend('#' + x for x in attrs[key].split()) if key.startswith('aria-') else self.refs.append(attrs[key])
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack or self.stack[-1] != tag:
            self.errors.append(f'unbalanced </{tag}> after {self.stack[-3:]}')
        if tag in self.stack:
            while self.stack.pop() != tag:
                pass


pages = {}
for file in ROOT.glob('*.html'):
    page = Page()
    page.feed(file.read_text(encoding='utf-8'))
    pages[file.name] = page

errors = []
for name, page in pages.items():
    issues = list(page.errors)
    issues += [f'duplicate id: {key}' for key, count in Counter(page.ids).items() if count > 1]
    if page.stack:
        issues.append(f'unclosed tags: {page.stack}')
    if page.h1 != 1:
        issues.append(f'expected one h1, found {page.h1}')
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        dest = ROOT / unquote(url.path) if url.path else ROOT / name
        if not dest.exists():
            issues.append(f'missing file: {ref}')
        elif url.fragment and dest.name in pages and unquote(url.fragment) not in pages[dest.name].ids:
            issues.append(f'missing anchor: {ref}')
    errors.extend(f'{name}: {issue}' for issue in issues)

if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages; HTML nesting, IDs, local files, media and anchors.')

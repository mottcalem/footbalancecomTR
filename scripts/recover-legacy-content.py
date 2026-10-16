"""Recover public legacy content without changing its URLs.
Run with the bundled Python runtime (lxml), then npm run seo:generate.
Fetches are cached in /tmp/footbalance-content-recovery for repeatable inspection.
"""
import concurrent.futures
import hashlib
import html as escape_html
import json
import re
import urllib.request
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
from lxml import html, etree

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path('/tmp/footbalance-content-recovery')
CACHE.mkdir(exist_ok=True)
BASE = 'https://footbalance.com.tr'

def read(name):
    return json.loads((ROOT / name).read_text())

def save(name, data):
    (ROOT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def text(el):
    return ' '.join(el.text_content().split())

def local(url):
    u = urlparse(urljoin(BASE, url))
    return unquote(u.path) + ('?' + u.query if u.query else '') + ('#' + u.fragment if u.fragment else '') if u.netloc in ('footbalance.com.tr', 'www.footbalance.com.tr') else url

def fetch(path):
    key = hashlib.sha256(path.encode()).hexdigest()
    f = CACHE / (key + '.json')
    if f.exists():
        return json.loads(f.read_text())
    try:
        req = urllib.request.Request(urljoin(BASE, path), headers={'User-Agent': 'FootBalanceContentMigration/1.0'})
        with urllib.request.urlopen(req, timeout=35) as response:
            result = {'path': path, 'final': local(response.url), 'status': response.status, 'html': response.read().decode('utf-8', errors='replace')}
    except Exception as e:
        result = {'path': path, 'error': str(e)}
    f.write_text(json.dumps(result, ensure_ascii=False))
    return result

def meta(tree, name, attr='name'):
    return next(iter(tree.xpath(f'//meta[@{attr}="{name}"]/@content')), '')

def media(url):
    url = urljoin(BASE, url)
    u = urlparse(url)
    if u.netloc not in ('footbalance.com.tr', 'www.footbalance.com.tr') or not u.path.startswith('/wp-content/uploads/'):
        return url
    path = unquote(u.path)
    dest = ROOT / 'public' / path.lstrip('/')
    if not dest.exists():
        dest.parent.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(url, headers={'User-Agent': 'FootBalanceContentMigration/1.0'})
        with urllib.request.urlopen(req, timeout=35) as response:
            data = response.read()
            if not response.headers.get('Content-Type', '').startswith('image/'):
                raise ValueError('Non-image response: ' + url)
            dest.write_bytes(data)
    return path

ALLOWED = set('p div span strong b em i u s a ul ol li h2 h3 h4 h5 h6 blockquote img figure figcaption table thead tbody tr th td br hr iframe video source sup sub dl dt dd pre code details summary'.split())

def clean(element):
    node = html.fromstring(html.tostring(element, encoding='unicode'))
    node.attrib.clear()
    for bad in node.xpath('.//script|.//style|.//svg|.//form|.//noscript|.//button|.//input|.//select'):
        bad.drop_tree()
    for e in list(node.iterdescendants()):
        if not isinstance(e.tag, str):
            continue
        if e.tag == 'h1':
            e.tag = 'h2'
        if e.tag not in ALLOWED:
            e.drop_tag()
            continue
        attrs = dict(e.attrib)
        e.attrib.clear()
        for key in ('alt', 'title', 'colspan', 'rowspan', 'width', 'height'):
            if key in attrs:
                e.set(key, attrs[key])
        if e.tag == 'a':
            href = attrs.get('href', '')
            if href.startswith(('javascript:', '#elementor', '#popup')):
                e.drop_tag()
            elif href and urlparse(href).scheme in ('', 'https', 'http', 'mailto', 'tel'):
                e.set('href', local(href))
        if e.tag == 'img':
            src = attrs.get('data-src') or attrs.get('src', '')
            if not src or src.startswith('data:'):
                e.drop_tree()
                continue
            e.set('src', media(src))
            e.set('loading', 'lazy')
        if e.tag in ('iframe', 'video', 'source'):
            src = attrs.get('src', '')
            if e.tag == 'iframe' and urlparse(src).netloc not in ('www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'):
                e.drop_tree()
                continue
            if src:
                e.set('src', src)
            if e.tag == 'iframe':
                e.set('title', attrs.get('title') or 'Video')
                e.set('loading', 'lazy')
                e.set('allowfullscreen', '')
    return html.tostring(node, encoding='unicode')

catalogs = {}
for path in ['/urunler/', '/en/products/']:
    source = fetch(path)
    if 'error' in source:
        raise RuntimeError(source)
    tree = html.fromstring(source['html'])
    main = tree.xpath('//main')[0]
    sections = []
    for widget in main.xpath('.//*[@data-widget_type="posts.cards"]'):
        preceding = widget.xpath('preceding::*[@data-widget_type="heading.default"]')
        headings = preceding[-2:]
        products = []
        for article in widget.xpath('.//article'):
            a = article.xpath('.//*[contains(@class,"elementor-post__title")]//a')[0]
            image = article.xpath('.//img')[0]
            excerpt = article.xpath('.//*[contains(@class,"elementor-post__excerpt")]')
            products.append({'title': text(a), 'path': local(a.get('href')), 'image': media(image.get('src')), 'alt': image.get('alt', ''), 'description': text(excerpt[0]) if excerpt else ''})
        sections.append({'title': text(headings[0]), 'description': text(headings[1]), 'products': products})
    assert len(sections) == 5 and sum(len(s['products']) for s in sections) == 30, path
    catalogs[path] = {'title': text(main.xpath('.//h1')[0]), 'sections': sections}
    print('Catalog', path, '30 products', flush=True)
save('src/data/product-catalogs.json', catalogs)
pairs = {}
tr_products = [p for section in catalogs['/urunler/']['sections'] for p in section['products']]
en_products = [p for section in catalogs['/en/products/']['sections'] for p in section['products']]
for tr, en in zip(tr_products, en_products):
    pair = {'tr': tr['path'], 'en': en['path']}
    pairs[tr['path']] = pair
    pairs[en['path']] = pair
save('src/data/product-language-pairs.json', pairs)

pages = read('src/data/legacy-pages.json')
imports = read('src/data/imported-pages.json')
redirects = read('src/data/legacy-redirects.json')
overrides = read('src/data/legacy-redirect-overrides.json')
products = {}
known_posts = {p['path'] for p in read('src/data/blog-posts.json')}
paths = {p['path'] for c in catalogs.values() for s in c['sections'] for p in s['products']}
# Additional traffic-bearing legacy pages identified in the supplied Search Console audit.
audit_path = ROOT / 'docs/traffic-content-recovery-sources.json'
if audit_path.exists():
    paths.update(r['path'] for r in json.loads(audit_path.read_text())['pages'] if r['clicks'] > 0 and r['status'] in ('placeholder', 'unmapped'))
paths.update(['/ortopedik-tabanlik-hakkinda/', '/en/frequently-asked-questions/', '/en/personalized-insoles-reviews/', '/en/insole-molding-videos/'])
paths.difference_update(catalogs)
paths.difference_update(redirects)
paths.discard('/en/')
results = []
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    results = list(pool.map(fetch, sorted(paths)))
report = {'catalogs': {path: 30 for path in catalogs}, 'restored': [], 'redirects': [], 'unresolved': []}
for source in results:
    path = source['path']
    if 'error' in source:
        report['unresolved'].append({'path': path, 'reason': source['error']})
        continue
    final = source['final']
    tree = html.fromstring(source['html'])
    if 'Bot Verification' in text(tree)[:200] or 'Checking your browser' in text(tree)[:200]:
        report['unresolved'].append({'path': path, 'reason': 'Source bot challenge'})
        continue
    if path != final:
        # Only use a redirect when a real destination already exists locally.
        if final in known_posts or final in {p['path'] for p in pages} or final in paths or final in catalogs or final == '/':
            overrides[path] = final
            redirects[path] = final
            report['redirects'].append({'path': path, 'target': final})
        else:
            report['unresolved'].append({'path': path, 'reason': 'Redirect target not imported: ' + final})
        continue
    roots = tree.xpath('//*[@data-elementor-type="product-post"]')
    title = next(iter(tree.xpath('//title/text()')), '')
    description = meta(tree, 'description')
    image_url = meta(tree, 'og:image', 'property')
    if roots:
        body = roots[0]
        heading = body.xpath('.//h1')
        name = text(heading[0]) if heading else title.split(' | ')[0]
        gallery = []
        for img in body.xpath('.//img[not(ancestor::article) and not(contains(@class,"woothumbs-thumbnails"))]'):
            url = img.get('data-large_image') or img.get('data-iconic-woothumbs-src') or img.get('data-src') or img.get('src', '')
            if url and '/wp-content/uploads/' in url:
                item = {'src': media(url), 'alt': img.get('alt', '')}
                if item['src'] not in {i['src'] for i in gallery}:
                    gallery.append(item)
        chunks = []
        for w in body.xpath('.//*[@data-widget_type]'):
            typ = w.get('data-widget_type')
            if typ in ('heading.default', 'text-editor.default', 'woocommerce-product-content.default'):
                if text(w) in (name, 'Beraberinde Önerilen Ürünler', 'Related Products'):
                    continue
                chunks.append(clean(w))
        content = '\n'.join(chunks)
        if len(html.fromstring('<div>'+content+'</div>').text_content().strip()) < 80:
            report['unresolved'].append({'path': path, 'reason': 'Product description could not be extracted'})
            continue
        products[path] = {'title': name, 'images': gallery, 'content': content}
    else:
        roots = tree.xpath('//main')
        if not roots:
            roots = tree.xpath('//*[@data-elementor-type="wp-page"]')
        if not roots:
            roots = tree.xpath('//*[@data-elementor-type="product-archive"]')
        if not roots:
            report['unresolved'].append({'path': path, 'reason': 'No supported content container'})
            continue
        body = roots[0]
        if body.get('data-elementor-type') == 'product-archive':
            slug = path.rstrip('/').split('/')[-1]
            source_catalog = catalogs['/en/products/' if path.startswith('/en/') else '/urunler/']
            matching = [section for section in source_catalog['sections'] if any('/'+slug+'/' in product['path'] for product in section['products'])]
            if matching:
                archive_heading = body.xpath('.//h1')
                catalogs[path] = {'title': text(archive_heading[0]) if archive_heading else matching[0]['title'], 'sections': matching}
        # Keep real accordion text and links, exclude theme popup/measurement widgets.
        for bad in body.xpath('.//*[@data-widget_type="html.default"]'):
            bad.drop_tree()
        for heading in body.xpath('.//h1'):
            heading.drop_tree()
        content = clean(body)
        if len(html.fromstring(content).text_content().strip()) < 80:
            report['unresolved'].append({'path': path, 'reason': 'Insufficient source content'})
            continue
    imports[path] = {'content': content, 'testimonials': imports.get(path, {}).get('testimonials', [])}
    record = next((p for p in pages if p['path'] == path), None)
    if not record:
        record = {'path': path, 'modified': '', 'title': title, 'description': description, 'image': local(image_url) if image_url else '', 'robots': meta(tree, 'robots')}
        pages.append(record)
    else:
        record.update(title=title or record['title'], description=description or record['description'])
    report['restored'].append(path)
    print('Restored', path, flush=True)
save('src/data/product-catalogs.json', catalogs)
# Catalog metadata and records keep their established URLs.
for path in catalogs:
    if not any(p['path'] == path for p in pages):
        raise RuntimeError('Catalog metadata missing: '+path)
save('src/data/product-pages.json', products)
save('src/data/imported-pages.json', imports)
save('src/data/legacy-pages.json', pages)
restored_paths = set(report['restored']) | set(catalogs)
save('src/data/recovered-page-metadata.json', [p for p in pages if p['path'] in restored_paths])
save('src/data/legacy-redirects.json', redirects)
save('src/data/legacy-redirect-overrides.json', overrides)
save('docs/content-recovery-audit.json', report)
print('Restored',len(report['restored']),'redirects',len(report['redirects']),'unresolved',len(report['unresolved']),flush=True)

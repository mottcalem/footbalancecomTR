"""Import a WordPress WXR and sitemap pair. Network work is explicit (--crawl).
Usage: python3 scripts/import-wordpress.py --export FILE --pages FILE --posts FILE [--crawl]
"""
import argparse, concurrent.futures, hashlib, html, json, re, urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote, quote

parser=argparse.ArgumentParser()
for name in ('export','pages','posts'): parser.add_argument('--'+name, required=True)
parser.add_argument('--crawl',action='store_true')
args=parser.parse_args()
ROOT=Path(__file__).resolve().parents[1]
CACHE=Path('/private/tmp/footbalance-migration');CACHE.mkdir(exist_ok=True)
NS={'wp':'http://wordpress.org/export/1.2/','content':'http://purl.org/rss/1.0/modules/content/','excerpt':'http://wordpress.org/export/1.2/excerpt/','dc':'http://purl.org/dc/elements/1.1/'}
items=ET.parse(args.export).findall('./channel/item')
def field(x,key): return x.findtext(key,default='',namespaces=NS)
def path(url): return unquote(urlparse(url).path)
def sitemap(file): return [{ 'path':path(x.findtext('{*}loc')), 'modified':x.findtext('{*}lastmod') or ''} for x in ET.parse(file).getroot()]
page_urls=sitemap(args.pages); post_urls=sitemap(args.posts)
posts=[x for x in items if field(x,'wp:post_type')=='post' and field(x,'wp:status')=='publish']
attachments={field(x,'wp:post_id'):field(x,'wp:attachment_url') for x in items if field(x,'wp:post_type')=='attachment'}
urls=sorted(set([x['path'] for x in page_urls+post_urls]+[path(field(x,'link')) for x in posts]))
def get(url):
 return urllib.request.urlopen(urllib.request.Request(quote(url,safe=':/?=&%'),headers={'User-Agent':'FootBalanceMigration/1.0'}),timeout=35).read()
def cachefile(p):return CACHE/(hashlib.sha256(p.encode()).hexdigest()+'.html')
class Meta(HTMLParser):
 def __init__(self):super().__init__();self.meta={};self.title='';self.intitle=False;self.inhead=False
 def handle_starttag(self,t,a):
  d=dict(a)
  if t=='head':self.inhead=True
  if t=='title' and self.inhead:self.intitle=True
  if t=='meta' and self.inhead: self.meta[d.get('name',d.get('property',''))]=d.get('content','')
 def handle_endtag(self,t):
  if t=='title':self.intitle=False
  if t=='head':self.inhead=False
 def handle_data(self,d):
  if self.intitle:self.title+=d
errors=[]
def crawl(p):
 f=cachefile(p)
 if not f.exists():
  try:f.write_bytes(get('https://footbalance.com.tr'+p))
  except Exception as e:return {'path':p,'error':str(e)}
 return None
if args.crawl:
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  for i,result in enumerate(pool.map(crawl,urls)):
   if result:errors.append(result)
   if (i+1)%30==0:print('Crawled',i+1,'/',len(urls),flush=True)
meta={}
for p in urls:
 if cachefile(p).exists():
  m=Meta();m.feed(cachefile(p).read_text(errors='replace'));meta[p]={'title':m.title.strip(),'description':m.meta.get('description',''),'image':m.meta.get('og:image',''),'robots':m.meta.get('robots','')}

class Clean(HTMLParser):
 allowed=set('p div span strong b em i u s a ul ol li h2 h3 h4 h5 h6 blockquote img figure figcaption table thead tbody tr th td br hr iframe video source sup sub dl dt dd pre code'.split())
 void={'img','br','hr','source'}
 def __init__(self):super().__init__(convert_charrefs=True);self.out=[];self.block=0;self.media=set()
 def handle_starttag(self,t,a):
  if t in ('script','style','object'):self.block+=1;return
  if self.block or t not in self.allowed:return
  d=dict(a); attrs={}
  for k,v in d.items():
   if k not in ('href','src','alt','title','colspan','rowspan','width','height','id','controls'):continue
   if v is None:v=''
   if k in ('href','src'):
    if not (v.startswith(('/', '#','https://','http://','mailto:','tel:'))):continue
    u=urlparse(v)
    if u.hostname in ('footbalance.com.tr','www.footbalance.com.tr'):
     v=unquote(u.path)+('?' + u.query if u.query else '')+('#'+u.fragment if u.fragment else '')
    if v.startswith('/wp-content/uploads/') and re.search(r'\.(?:png|jpe?g|webp|gif|svg|avif)(?:\?|$)',v,re.I):self.media.add(v.split('?')[0]);v=v.split('?')[0]
   if k in ('width','height') and not v.isdigit():continue
   attrs[k]=v
  if t=='iframe':
   u=urlparse(attrs.get('src',''))
   if u.hostname not in ('www.youtube.com','www.youtube-nocookie.com','player.vimeo.com'):return
   attrs.update(loading='lazy',title=attrs.get('title','Video'),allowfullscreen='')
  if t=='img':attrs.update(loading='lazy',decoding='async')
  self.out.append('<'+t+''.join(' '+k+'="'+html.escape(v,quote=True)+'"' for k,v in attrs.items())+'>')
 def handle_endtag(self,t):
  if t in ('script','style','object'):
   self.block=max(0,self.block-1);return
  if not self.block and t in self.allowed and t not in self.void:self.out.append('</'+t+'>')
 def handle_data(self,d):
  if not self.block:self.out.append(html.escape(d))

def text(s):return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',s))).strip()
def elementor(nodes):
 out=[]
 for node in nodes:
  settings=node.get('settings',{}); typ=node.get('widgetType')
  if typ=='text-editor':out.append(settings.get('editor',''))
  elif typ=='heading':out.append('<h2>'+html.escape(settings.get('title',''))+'</h2>')
  elif typ=='image':out.append('<img src="'+html.escape(settings.get('image',{}).get('url',''),quote=True)+'" alt="">')
  elif typ=='video':
   url=settings.get('youtube_url','');vid=re.search(r'(?:v=|youtu.be/)([\w-]+)',url)
   if vid:out.append('<iframe src="https://www.youtube.com/embed/'+vid[1]+'"></iframe>')
  out+=elementor(node.get('elements',[]))
 return out
overrides_file=ROOT/'src/data/blog-image-overrides.json'
image_overrides=json.loads(overrides_file.read_text()) if overrides_file.exists() else {}
records=[];media={'/wp-content/uploads/2023/07/thumb.jpg'}
for x in posts:
 p=path(field(x,'link')); title=html.unescape(field(x,'title')); pm={field(m,'wp:meta_key'):field(m,'wp:meta_value') for m in x.findall('wp:postmeta',NS)}
 content=field(x,'content:encoded')
 if not text(content) and pm.get('_elementor_data'):
  content='\n'.join(elementor(json.loads(pm['_elementor_data'])))
 content=re.sub(r'\[caption[^\]]*\](.*?)\[/caption\]',r'<figure>\1</figure>',content,flags=re.S)
 content=re.sub(r'\[/?(?:gallery|embed|video|audio|quform|contact-form-7)[^\]]*\]','',content)
 # WordPress classic editor stores paragraphs as blank-line-separated plain text.
 if not re.search(r'<(?:p|div|h[2-6]|ul|ol|table|figure)\b',content):
  content='\n'.join('<p>'+part.replace('\n','<br>')+'</p>' for part in re.split(r'\n\s*\n',content.strip()) if part.strip())
 clean=Clean();clean.feed(content);content=''.join(clean.out);media.update(clean.media)
 featured=attachments.get(pm.get('_thumbnail_id',''),'')
 if not featured:featured=image_overrides.get(p,'')
 if featured:featured=path(featured);media.add(featured)
 live=meta.get(p,{})
 seo_title=live.get('title') or pm.get('rank_math_title') or title+' | FootBalance Türkiye'
 for key,value in {'%title%':title,'%sitename%':'FootBalance Türkiye','%sep%':'|','%currentyear%':'2026'}.items():seo_title=seo_title.replace(key,value)
 description=live.get('description') or pm.get('rank_math_description') or text(content)[:157].rsplit(' ',1)[0]+'…'
 records.append({'id':field(x,'wp:post_id'),'path':p,'title':title,'seoTitle':seo_title,'description':html.unescape(description),'content':content,'image':featured,'published':field(x,'wp:post_date').replace(' ','T')+'+03:00','modified':field(x,'wp:post_modified').replace(' ','T')+'+03:00','language':'en' if p.startswith('/en/') else 'tr','categories':[c.text for c in x.findall('category') if c.attrib.get('domain')=='category']})
for m in meta.values():
 if m.get('image') and '/wp-content/uploads/' in m['image']:media.add(path(m['image']))
# Preserve every media URL used in article markup, so existing image links remain valid.
def download(p):
 if not p.startswith('/wp-content/uploads/') or '..' in Path(p).parts:return None
 dest=ROOT/'public'/p.lstrip('/');dest.parent.mkdir(parents=True,exist_ok=True)
 if not dest.exists():
  try:dest.write_bytes(get('https://footbalance.com.tr'+p))
  except Exception as e:return {'path':p,'error':str(e)}
 return None
if args.crawl:
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  for i,result in enumerate(pool.map(download,sorted(media))):
   if result:errors.append(result)
   if (i+1)%40==0:print('Media',i+1,'/',len(media),flush=True)
# Recover historical short links referenced by the imported articles.
from collections import defaultdict
by_slug=defaultdict(list)
for record in records:by_slug[record['path'].rstrip('/').split('/')[-1]].append(record['path'])
redirects={'/randevu-al/':'/ucretsiz-ayak-analizi/'}
known=set(x['path'] for x in records+page_urls)
extra_paths=set()
for record in records:
 for href in re.findall(r'href="(/[^"?#]+)',record['content']):
  href=html.unescape(href).rstrip('/')+'/'
  if href in known or href.startswith('/wp-content/'):continue
  matches=by_slug[href.rstrip('/').split('/')[-1]]
  if len(matches)==1:redirects[href]=matches[0]
  elif href not in redirects:extra_paths.add(href)
for item in posts:
 target=path(field(item,'link'))
 for m in item.findall('wp:postmeta',NS):
  if field(m,'wp:meta_key')=='_wp_old_slug':
   slug=field(m,'wp:meta_value')
   if slug and '/' not in slug:
    for alias in ('/'+slug+'/',target.rsplit('/',2)[0]+'/'+slug+'/'):
     if alias not in known:redirects[alias]=target
extra_errors=[]
if args.crawl:
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  for result in pool.map(crawl,sorted(extra_paths)):
   if result:extra_errors.append(result)
for p in sorted(extra_paths):
 if cachefile(p).exists():
  m=Meta();m.feed(cachefile(p).read_text(errors='replace'))
  if m.title and '404' not in m.title and 'bulunamad' not in m.title.lower():
   page_urls.append({'path':p,'modified':'','title':m.title.strip(),'description':m.meta.get('description','') or text(m.title)+' — İçerik güncellenmektedir.','image':'https://footbalance.com.tr/wp-content/uploads/2023/07/thumb.jpg','robots':m.meta.get('robots','')})
(ROOT/'src/data/legacy-redirects.json').write_text(json.dumps(redirects,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/unresolved-legacy-links.json').write_text(json.dumps({'unavailableLiveLinks':extra_errors,'recoveredAliases':len(redirects)},ensure_ascii=False,indent=2)+'\n')
(ROOT/'src/data/blog-posts.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
(ROOT/'src/data/legacy-pages.json').write_text(json.dumps([{**x,**meta.get(x['path'],{})} for x in page_urls],ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/migration-inventory.json').write_text(json.dumps({'publishedPosts':len(records),'sitemapPosts':len(post_urls),'sitemapPages':len(sitemap(args.pages)),'recoveredLinkedPages':len(page_urls)-len(sitemap(args.pages)),'missingSitemapPosts':sorted(set(x['path'] for x in post_urls)-set(x['path'] for x in records)),'extraPublishedPosts':sorted(set(x['path'] for x in records)-set(x['path'] for x in post_urls)),'emptyPosts':[x['path'] for x in records if not text(x['content'])],'crawlErrors':errors,'mediaCount':len(media),'missingMedia':[p for p in sorted(media) if not (ROOT/'public'/p.lstrip('/')).exists()]},ensure_ascii=False,indent=2)+'\n')
print('Imported',len(records),'posts;',len(page_urls),'pages;',len(media),'media; errors:',len(errors),flush=True)

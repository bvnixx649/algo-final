import io, re
r = lambda f: io.open(f, encoding='utf-8').read()
p = r('page.html')
p = p.replace('/*BANK*/', r('bank.js')).replace('/*CORE*/', r('core.js')).replace('/*ALGO789*/', r('algo789.js')).replace('/*CH789*/', r('ch789.js'))
io.open('algo-final.html', 'w', encoding='utf-8', newline='\n').write(p)
# standalone document for GitHub Pages
head = ('<!doctype html>\n<html lang="th">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="theme-color" media="(prefers-color-scheme: light)" content="#FAFAF9">\n'
        '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#101013">\n'
        '<meta name="description" content="สรุปและฝึกควิซ Algorithm 254383 ก่อนสอบ final">\n'
        '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>\n')
cut = p.index('<header')
doc = head + p[:cut] + '</head>\n<body>\n' + p[cut:] + '\n</body>\n</html>\n'
io.open('index.html', 'w', encoding='utf-8', newline='\n').write(doc)
scripts = re.findall(r'<script>(.*?)</script>', p, re.S)
io.open('all.js', 'w', encoding='utf-8').write('\n;\n'.join(scripts))
print(len(p), 'chars; emdash', p.count('—'), 'endash', p.count('–'), 'middot', p.count('·'))

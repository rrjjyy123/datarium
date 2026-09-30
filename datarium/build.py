"""src/ 파일을 합쳐 index.html(단독 실행용)을 만든다.  사용: python build.py"""
from pathlib import Path
s = Path('src')
js = '\n'.join((s / f).read_text(encoding='utf-8') for f in ['engine.js', 'worlds.js', 'story.js'])
html = f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>html,body{{margin:0}}</style>
{(s / 'page.html').read_text(encoding='utf-8')}
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
{js}
</script>
</html>
'''
Path('index.html').write_text(html, encoding='utf-8')
print('index.html 생성 완료', len(html), 'bytes')

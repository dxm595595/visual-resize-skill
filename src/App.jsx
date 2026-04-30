import { useEffect, useMemo, useState } from 'react';

const MODULE_KEYS = ['background', 'subject', 'title', 'subtitle', 'cta', 'copyright', 'decor'];

const MODULE_LABELS = {
  background: '背景',
  subject: '主体视觉',
  title: '主标题',
  subtitle: '副标题',
  cta: 'CTA / 授权信息',
  copyright: '版权信息',
  decor: '装饰元素'
};

const TARGET_SIZES = [
  { key: '608x344', width: 608, height: 344, label: '608x344 banner', layout: 'left-right' },
  { key: '1400x1400', width: 1400, height: 1400, label: '1400x1400 banner', layout: 'top-bottom' },
  { key: '1440x617', width: 1440, height: 617, label: '1440x617 banner', layout: 'left-right-wide' },
  { key: '1440x2864', width: 1440, height: 2864, label: '1440x2864 海报', layout: 'poster' }
];

const createModuleRect = () => ({ enabled: true, x: 0, y: 0, width: 100, height: 100 });

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function App() {
  const [imageSrc, setImageSrc] = useState('');
  const [imageEl, setImageEl] = useState(null);
  const [moduleRects, setModuleRects] = useState(() => Object.fromEntries(MODULE_KEYS.map((k) => [k, createModuleRect()])));
  const [textContent, setTextContent] = useState({
    title: '输入主标题',
    subtitle: '输入副标题',
    cta: '输入 CTA / 授权信息',
    copyright: '© 输入版权信息'
  });
  const [subjectControl, setSubjectControl] = useState({ scale: 100, offsetX: 0, offsetY: 0 });
  const [textStyle, setTextStyle] = useState({ fontSize: 48, lineHeight: 1.3, align: 'left' });
  const [bgStyle, setBgStyle] = useState({ fillMode: 'cover', blur: 24, bgColor: '#111827' });
  const [renders, setRenders] = useState({});

  useEffect(() => {
    if (!imageSrc) return setImageEl(null);
    const img = new Image();
    img.onload = () => setImageEl(img);
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (!imageEl) return setRenders({});
    const next = {};
    TARGET_SIZES.forEach((size) => {
      next[size.key] = renderLayout({ size, imageEl, moduleRects, textContent, subjectControl, textStyle, bgStyle });
    });
    setRenders(next);
  }, [imageEl, moduleRects, textContent, subjectControl, textStyle, bgStyle]);

  const activeSizes = useMemo(() => TARGET_SIZES, []);

  const updateRect = (key, field, value) => {
    setModuleRects((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const onUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const downloadPng = (key) => {
    if (!renders[key]) return;
    const a = document.createElement('a');
    a.href = renders[key];
    a.download = `${key}-layout.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-5">
      <div className="mx-auto grid max-w-[1600px] gap-4 lg:grid-cols-[420px,1fr]">
        <section className="space-y-4 rounded-xl border bg-white p-4">
          <h1 className="text-xl font-bold">多尺寸版式延展工具</h1>
          <input type="file" accept="image/*" className="w-full rounded border p-2 text-sm" onChange={onUpload} />
          {imageSrc && <img src={imageSrc} alt="source" className="h-36 w-full rounded border object-contain bg-slate-50" />}

          <div className="space-y-2">
            <h2 className="font-semibold">模块标注区</h2>
            {MODULE_KEYS.map((k) => (
              <div key={k} className="rounded border bg-slate-50 p-2 text-xs">
                <label className="mb-1 flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={moduleRects[k].enabled} onChange={(e) => updateRect(k, 'enabled', e.target.checked)} />{MODULE_LABELS[k]}</label>
                <div className="grid grid-cols-4 gap-1">
                  {['x', 'y', 'width', 'height'].map((field) => (
                    <input key={field} type="number" value={moduleRects[k][field]} onChange={(e) => updateRect(k, field, Number(e.target.value || 0))} className="rounded border p-1" placeholder={field} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold">文字内容输入区</h2>
            {Object.keys(textContent).map((key) => (
              <label key={key} className="block text-sm">
                {MODULE_LABELS[key] || key}
                <textarea className="mt-1 w-full rounded border p-2" rows={2} value={textContent[key]} onChange={(e) => setTextContent((p) => ({ ...p, [key]: e.target.value }))} />
              </label>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <h2 className="font-semibold">目标尺寸</h2>
            {activeSizes.map((s) => <div key={s.key} className="rounded border bg-slate-50 p-2">{s.label}（{s.width}x{s.height}）</div>)}
          </div>

          <div className="space-y-2 text-sm">
            <h2 className="font-semibold">模块调节项</h2>
            <label className="block">主体缩放 {subjectControl.scale}%<input type="range" min={60} max={160} value={subjectControl.scale} onChange={(e) => setSubjectControl((p) => ({ ...p, scale: Number(e.target.value) }))} className="w-full" /></label>
            <label className="block">主体 X 位移 {subjectControl.offsetX}<input type="range" min={-40} max={40} value={subjectControl.offsetX} onChange={(e) => setSubjectControl((p) => ({ ...p, offsetX: Number(e.target.value) }))} className="w-full" /></label>
            <label className="block">主体 Y 位移 {subjectControl.offsetY}<input type="range" min={-40} max={40} value={subjectControl.offsetY} onChange={(e) => setSubjectControl((p) => ({ ...p, offsetY: Number(e.target.value) }))} className="w-full" /></label>
            <label className="block">文字字号<input type="number" className="ml-2 w-20 rounded border p-1" value={textStyle.fontSize} onChange={(e) => setTextStyle((p) => ({ ...p, fontSize: clamp(Number(e.target.value || 16), 14, 120) }))} /></label>
            <label className="block">文字行距<input type="number" step="0.1" className="ml-2 w-20 rounded border p-1" value={textStyle.lineHeight} onChange={(e) => setTextStyle((p) => ({ ...p, lineHeight: clamp(Number(e.target.value || 1.2), 1, 2.4) }))} /></label>
            <label className="block">对齐方式
              <select className="ml-2 rounded border p-1" value={textStyle.align} onChange={(e) => setTextStyle((p) => ({ ...p, align: e.target.value }))}>
                <option value="left">左对齐</option><option value="center">居中</option><option value="right">右对齐</option>
              </select>
            </label>
            <label className="block">背景填充
              <select className="ml-2 rounded border p-1" value={bgStyle.fillMode} onChange={(e) => setBgStyle((p) => ({ ...p, fillMode: e.target.value }))}>
                <option value="cover">cover</option><option value="contain">contain</option>
              </select>
            </label>
            <label className="block">模糊扩展 {bgStyle.blur}<input type="range" min={0} max={40} value={bgStyle.blur} onChange={(e) => setBgStyle((p) => ({ ...p, blur: Number(e.target.value) }))} className="w-full" /></label>
            <label className="block">背景色<input type="color" className="ml-2" value={bgStyle.bgColor} onChange={(e) => setBgStyle((p) => ({ ...p, bgColor: e.target.value }))} /></label>
          </div>

          <button className="w-full rounded bg-slate-900 py-2 text-white">生成延展图（实时预览）</button>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">结果区</h2>
          <div className="grid gap-3 xl:grid-cols-2">
            {TARGET_SIZES.map((s) => (
              <article key={s.key} className="rounded-lg border p-2">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{s.label}</h3>
                  <button className="rounded border px-2 py-1 text-xs" onClick={() => downloadPng(s.key)} disabled={!renders[s.key]}>下载 PNG</button>
                </div>
                <div className="rounded border bg-slate-50 p-2">
                  {renders[s.key] ? <img src={renders[s.key]} alt={s.key} className="max-h-96 w-full object-contain" /> : <div className="h-40" />}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function renderLayout({ size, imageEl, moduleRects, textContent, subjectControl, textStyle, bgStyle }) {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');

  const bgRect = sanitizeRect(moduleRects.background, imageEl);
  const subjectRect = sanitizeRect(moduleRects.subject, imageEl);
  const decorRect = sanitizeRect(moduleRects.decor, imageEl);

  ctx.fillStyle = bgStyle.bgColor;
  ctx.fillRect(0, 0, size.width, size.height);
  if (moduleRects.background.enabled) drawBackground(ctx, imageEl, bgRect, size, bgStyle);

  const layout = getLayoutRegions(size);
  if (moduleRects.subject.enabled) drawSubject(ctx, imageEl, subjectRect, layout.visual, subjectControl);
  if (moduleRects.decor.enabled) drawDecor(ctx, imageEl, decorRect, layout.visual);

  drawTextBlocks(ctx, size, textContent, textStyle, layout, moduleRects);

  return canvas.toDataURL('image/png');
}

function getLayoutRegions(size) {
  if (size.layout === 'left-right' || size.layout === 'left-right-wide') {
    const leftRate = size.layout === 'left-right-wide' ? 0.4 : 0.46;
    return { text: { x: 0, y: 0, width: size.width * leftRate, height: size.height }, visual: { x: size.width * leftRate, y: 0, width: size.width * (1 - leftRate), height: size.height }, footer: null };
  }
  if (size.layout === 'top-bottom') {
    return { text: { x: 0, y: 0, width: size.width, height: size.height * 0.36 }, visual: { x: 0, y: size.height * 0.36, width: size.width, height: size.height * 0.64 }, footer: null };
  }
  return { text: { x: 0, y: 0, width: size.width, height: size.height * 0.22 }, visual: { x: 0, y: size.height * 0.22, width: size.width, height: size.height * 0.58 }, footer: { x: 0, y: size.height * 0.8, width: size.width, height: size.height * 0.2 } };
}

function drawBackground(ctx, imageEl, rect, size, bgStyle) {
  const source = cropToCanvas(imageEl, rect);
  const fit = bgStyle.fillMode === 'cover' ? Math.max(size.width / source.width, size.height / source.height) : Math.min(size.width / source.width, size.height / source.height);
  const w = source.width * fit;
  const h = source.height * fit;
  const x = (size.width - w) / 2;
  const y = (size.height - h) / 2;
  if (bgStyle.blur > 0) {
    ctx.filter = `blur(${bgStyle.blur}px) saturate(1.05)`;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(source, x, y, w, h);
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
  }
  ctx.drawImage(source, x, y, w, h);
}

function drawSubject(ctx, imageEl, rect, area, control) {
  const source = cropToCanvas(imageEl, rect);
  const base = Math.min(area.width / source.width, area.height / source.height) * (control.scale / 100);
  const w = source.width * base;
  const h = source.height * base;
  const x = area.x + (area.width - w) / 2 + (control.offsetX / 100) * area.width;
  const y = area.y + (area.height - h) / 2 + (control.offsetY / 100) * area.height;
  ctx.drawImage(source, x, y, w, h);
}

function drawDecor(ctx, imageEl, rect, area) {
  const source = cropToCanvas(imageEl, rect);
  const w = area.width * 0.24;
  const h = (source.height / source.width) * w;
  ctx.globalAlpha = 0.85;
  ctx.drawImage(source, area.x + area.width - w - 16, area.y + 16, w, h);
  ctx.globalAlpha = 1;
}

function drawTextBlocks(ctx, size, textContent, textStyle, layout, moduleRects) {
  const titleSize = textStyle.fontSize;
  const subtitleSize = Math.round(textStyle.fontSize * 0.5);
  const ctaSize = Math.round(textStyle.fontSize * 0.38);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = textStyle.align;
  const textX = textStyle.align === 'left' ? layout.text.x + 40 : textStyle.align === 'center' ? layout.text.x + layout.text.width / 2 : layout.text.x + layout.text.width - 40;
  let y = layout.text.y + 52;

  if (moduleRects.title.enabled) {
    ctx.font = `700 ${titleSize}px Inter, PingFang SC, sans-serif`;
    y = drawMultiLine(ctx, textContent.title, textX, y, layout.text.width - 80, titleSize * textStyle.lineHeight) + 12;
  }
  if (moduleRects.subtitle.enabled) {
    ctx.font = `500 ${subtitleSize}px Inter, PingFang SC, sans-serif`;
    y = drawMultiLine(ctx, textContent.subtitle, textX, y, layout.text.width - 80, subtitleSize * textStyle.lineHeight) + 10;
  }

  const footer = layout.footer || { x: layout.text.x, y: layout.text.y + layout.text.height - 140, width: layout.text.width, height: 120 };
  const footerX = textStyle.align === 'left' ? footer.x + 40 : textStyle.align === 'center' ? footer.x + footer.width / 2 : footer.x + footer.width - 40;

  if (moduleRects.cta.enabled) {
    ctx.font = `600 ${ctaSize}px Inter, PingFang SC, sans-serif`;
    drawMultiLine(ctx, textContent.cta, footerX, footer.y + 40, footer.width - 80, ctaSize * textStyle.lineHeight);
  }
  if (moduleRects.copyright.enabled) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `400 ${Math.max(14, Math.round(ctaSize * 0.8))}px Inter, PingFang SC, sans-serif`;
    drawMultiLine(ctx, textContent.copyright, footerX, footer.y + footer.height - 12, footer.width - 80, ctaSize * textStyle.lineHeight, true);
  }

  if (size.layout === 'poster') {
    const g = ctx.createLinearGradient(0, 0, 0, size.height);
    g.addColorStop(0, 'rgba(0,0,0,0.15)');
    g.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size.width, size.height);
  }
}

function drawMultiLine(ctx, text, x, y, maxWidth, lineHeight, fromBottom = false) {
  if (!text) return y;
  const chars = text.split('');
  const lines = [];
  let cur = '';
  chars.forEach((ch) => {
    const test = cur + ch;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = ch;
    } else cur = test;
  });
  if (cur) lines.push(cur);

  if (fromBottom) {
    const startY = y - lineHeight * (lines.length - 1);
    lines.forEach((line, i) => ctx.fillText(line, x, startY + i * lineHeight));
    return y;
  }
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

function sanitizeRect(rect, image) {
  return {
    x: clamp(rect.x, 0, image.width - 1),
    y: clamp(rect.y, 0, image.height - 1),
    width: clamp(rect.width, 1, image.width),
    height: clamp(rect.height, 1, image.height)
  };
}

function cropToCanvas(imageEl, rect) {
  const c = document.createElement('canvas');
  c.width = rect.width;
  c.height = rect.height;
  c.getContext('2d').drawImage(imageEl, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
  return c;
}

export default App;

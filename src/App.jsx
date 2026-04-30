import { useEffect, useMemo, useState } from 'react';

const SIZE_OPTIONS = [
  { key: '608x344', width: 608, height: 344, label: '608x344 banner（左文右图）' },
  { key: '1400x1400', width: 1400, height: 1400, label: '1400x1400 banner（上下图）' },
  { key: '1440x617', width: 1440, height: 617, label: '1440x617 banner（左文右图）' },
  { key: '1440x2864', width: 1440, height: 2864, label: '1440x2864 海报（上下图）' }
];

const FOCUS_POINTS = [
  { key: 'tl', label: '↖', x: 0, y: 0 }, { key: 'tc', label: '↑', x: 0.5, y: 0 }, { key: 'tr', label: '↗', x: 1, y: 0 },
  { key: 'cl', label: '←', x: 0, y: 0.5 }, { key: 'cc', label: '•', x: 0.5, y: 0.5 }, { key: 'cr', label: '→', x: 1, y: 0.5 },
  { key: 'bl', label: '↙', x: 0, y: 1 }, { key: 'bc', label: '↓', x: 0.5, y: 1 }, { key: 'br', label: '↘', x: 1, y: 1 }
];

const sectionCard = 'rounded-xl border border-slate-200 bg-white p-5 shadow-panel';

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function App() {
  const [imageSrc, setImageSrc] = useState('');
  const [imageEl, setImageEl] = useState(null);
  const [fitMode, setFitMode] = useState('cover');
  const [focus, setFocus] = useState('cc');
  const [zoom, setZoom] = useState(100);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [bgColor, setBgColor] = useState('#111827');
  const [blurFill, setBlurFill] = useState(true);
  const [renders, setRenders] = useState({});

  const focusPoint = useMemo(() => FOCUS_POINTS.find((f) => f.key === focus) || FOCUS_POINTS[4], [focus]);

  useEffect(() => {
    if (!imageSrc) {
      setImageEl(null);
      return;
    }
    const img = new Image();
    img.onload = () => setImageEl(img);
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (!imageEl) {
      setRenders({});
      return;
    }

    const next = {};
    for (const size of SIZE_OPTIONS) {
      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size.width, size.height);

      const scaleBase = fitMode === 'cover'
        ? Math.max(size.width / imageEl.width, size.height / imageEl.height)
        : Math.min(size.width / imageEl.width, size.height / imageEl.height);
      const scale = scaleBase * (zoom / 100);
      const drawW = imageEl.width * scale;
      const drawH = imageEl.height * scale;

      if (fitMode === 'contain' && blurFill) {
        const bgScale = Math.max(size.width / imageEl.width, size.height / imageEl.height);
        const bgW = imageEl.width * bgScale;
        const bgH = imageEl.height * bgScale;
        const bgX = (size.width - bgW) / 2;
        const bgY = (size.height - bgH) / 2;
        ctx.filter = 'blur(32px) saturate(1.05)';
        ctx.globalAlpha = 0.85;
        ctx.drawImage(imageEl, bgX, bgY, bgW, bgH);
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
      }

      const baseX = -focusPoint.x * (drawW - size.width);
      const baseY = -focusPoint.y * (drawH - size.height);
      const x = baseX + (offsetX / 100) * size.width;
      const y = baseY + (offsetY / 100) * size.height;

      ctx.drawImage(imageEl, x, y, drawW, drawH);
      next[size.key] = canvas.toDataURL('image/png');
    }

    setRenders(next);
  }, [bgColor, blurFill, fitMode, focusPoint, imageEl, offsetX, offsetY, zoom]);

  const downloadSize = (key) => {
    const dataUrl = renders[key];
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${key}-${fitMode}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className={sectionCard}>
          <h1 className="text-2xl font-semibold">图像延展 / 调整大小工具</h1>
          <p className="mt-1 text-sm text-slate-600">上传一张图后，直接生成四种尺寸 PNG 预览并支持单独下载（纯前端 Canvas 处理，不重写原图文字）。</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
          <section className={`${sectionCard} space-y-4`}>
            <h2 className="text-lg font-semibold">控制面板</h2>
            <input
              type="file"
              accept="image/*"
              className="block w-full rounded-lg border border-slate-300 p-2 text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setImageSrc(String(reader.result || ''));
                reader.readAsDataURL(file);
              }}
            />
            {imageSrc && <img src={imageSrc} alt="原图预览" className="h-40 w-full rounded-lg border object-contain bg-slate-50" />}

            <div>
              <p className="mb-2 text-sm font-medium">适配模式</p>
              <div className="flex gap-2">
                <button className={`rounded border px-3 py-1 text-sm ${fitMode === 'cover' ? 'bg-slate-900 text-white' : 'bg-white'}`} onClick={() => setFitMode('cover')}>Cover（裁切填充）</button>
                <button className={`rounded border px-3 py-1 text-sm ${fitMode === 'contain' ? 'bg-slate-900 text-white' : 'bg-white'}`} onClick={() => setFitMode('contain')}>Contain（完整保留）</button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">九宫格焦点</p>
              <div className="grid grid-cols-3 gap-1">
                {FOCUS_POINTS.map((p) => (
                  <button key={p.key} onClick={() => setFocus(p.key)} className={`h-9 rounded border text-sm ${focus === p.key ? 'bg-slate-900 text-white' : 'bg-white'}`}>{p.label}</button>
                ))}
              </div>
            </div>

            <Slider label={`缩放：${zoom}%`} value={zoom} min={50} max={200} onChange={setZoom} />
            <Slider label={`X 位移：${offsetX}%`} value={offsetX} min={-50} max={50} onChange={setOffsetX} />
            <Slider label={`Y 位移：${offsetY}%`} value={offsetY} min={-50} max={50} onChange={setOffsetY} />

            <label className="block text-sm font-medium">背景颜色
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="mt-1 block h-10 w-full rounded border border-slate-300" />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={blurFill} onChange={(e) => setBlurFill(e.target.checked)} disabled={fitMode !== 'contain'} />
              contain 模式启用模糊背景填充
            </label>
          </section>

          <section className={`${sectionCard} space-y-4`}>
            <h2 className="text-lg font-semibold">生成结果预览（右侧）</h2>
            {!imageEl && <p className="text-sm text-slate-500">请先上传原图。</p>}
            <div className="grid gap-4 xl:grid-cols-2">
              {SIZE_OPTIONS.map((s) => (
                <article key={s.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{s.label}</h3>
                    <button onClick={() => downloadSize(s.key)} disabled={!renders[s.key]} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-40">下载 PNG</button>
                  </div>
                  <div className="flex justify-center rounded border bg-white p-2">
                    {renders[s.key] ? (
                      <img src={renders[s.key]} alt={s.label} className="max-h-64 w-auto rounded object-contain" />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center text-xs text-slate-400">等待生成</div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(clamp(Number(e.target.value), min, max))} className="mt-1 w-full" />
    </label>
  );
}

export default App;

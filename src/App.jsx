import { useEffect, useState } from 'react';

const TARGET_SIZES = [
  { key: '608x344', width: 608, height: 344, label: '608x344 banner', layout: 'left-right' },
  { key: '1400x1400', width: 1400, height: 1400, label: '1400x1400 banner', layout: 'top-bottom' },
  { key: '1440x617', width: 1440, height: 617, label: '1440x617 banner', layout: 'left-right' },
  { key: '1440x2864', width: 1440, height: 2864, label: '1440x2864 海报', layout: 'top-bottom' }
];

const REGION_LABELS = {
  title: '主标题区域',
  subtitle: '副标题区域',
  logo: 'Logo 区域',
  cta: 'CTA / 授权信息区域',
  copyright: '版权信息区域',
  subject: '主体视觉区域',
  background: '背景区域',
  decor: '装饰元素区域'
};

const AI_MOCK_NOTICE = '当前为 mock 识别，后续可接入真实 AI 视觉识别服务。';

function App() {
  const [imageSrc, setImageSrc] = useState('');
  const [imageEl, setImageEl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [renders, setRenders] = useState({});

  useEffect(() => {
    if (!imageSrc) {
      setImageEl(null);
      setAnalysisResult(null);
      setRenders({});
      return;
    }

    const img = new Image();
    img.onload = () => setImageEl(img);
    img.src = imageSrc;
  }, [imageSrc]);

  const onUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageEl) return;
    setAnalyzing(true);
    const result = await analyzeImage(imageEl);
    setAnalysisResult(result);
    setRenders({});
    setAnalyzing(false);
  };

  const handleGenerate = async () => {
    if (!imageEl || !analysisResult) return;
    setGenerating(true);

    const next = {};
    for (const size of TARGET_SIZES) {
      next[size.key] = renderFromAnalysis({ size, imageEl, analysisResult });
    }

    setRenders(next);
    setGenerating(false);
  };

  const downloadPng = (key) => {
    const dataUrl = renders[key];
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${key}-ai-extend.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-5">
      <div className="mx-auto grid max-w-[1700px] gap-4 lg:grid-cols-[430px,1fr]">
        <section className="space-y-4 rounded-xl border bg-white p-4">
          <h1 className="text-xl font-bold">AI 自动多尺寸视觉延展工具</h1>

          <div className="space-y-2">
            <label className="text-sm font-medium">上传头图</label>
            <input type="file" accept="image/*" className="w-full rounded border p-2 text-sm" onChange={onUpload} />
            {imageSrc && <img src={imageSrc} alt="source" className="h-40 w-full rounded border object-contain bg-slate-50" />}
          </div>

          <button
            className="w-full rounded bg-slate-900 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            onClick={handleAnalyze}
            disabled={!imageEl || analyzing}
          >
            {analyzing ? '分析中...' : '自动分析头图结构'}
          </button>

          <div className="space-y-2 rounded border bg-slate-50 p-3">
            <h2 className="font-semibold">AI 识别结果</h2>
            {!analysisResult && <p className="text-sm text-slate-600">请先上传头图并执行自动分析。</p>}
            {analysisResult && (
              <ul className="space-y-2 text-sm">
                {Object.entries(analysisResult.regions).map(([key, rect]) => (
                  <li key={key} className="rounded border bg-white p-2">
                    <p className="font-medium">{REGION_LABELS[key]}</p>
                    <p className="text-slate-600">
                      x:{Math.round(rect.x)} y:{Math.round(rect.y)} w:{Math.round(rect.width)} h:{Math.round(rect.height)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            className="w-full rounded bg-blue-600 py-2 text-white disabled:cursor-not-allowed disabled:bg-blue-300"
            onClick={handleGenerate}
            disabled={!analysisResult || generating}
          >
            {generating ? '生成中...' : '生成多尺寸延展图'}
          </button>

          {!analysisResult && <p className="text-sm text-amber-700">未完成识别前不允许生成延展图。</p>}
          <p className="rounded border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">{AI_MOCK_NOTICE}</p>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">多尺寸结果预览与下载</h2>
          <div className="grid gap-3 xl:grid-cols-2">
            {TARGET_SIZES.map((s) => (
              <article key={s.key} className="rounded-lg border p-2">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{s.label}</h3>
                  <button className="rounded border px-2 py-1 text-xs" onClick={() => downloadPng(s.key)} disabled={!renders[s.key]}>
                    下载 PNG
                  </button>
                </div>
                <div className="rounded border bg-slate-50 p-2">
                  {renders[s.key] ? <img src={renders[s.key]} alt={s.key} className="w-full object-contain" /> : <div className="h-44" />}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

async function analyzeImage(image) {
  await new Promise((r) => setTimeout(r, 450));

  const w = image.width;
  const h = image.height;
  const pad = Math.round(Math.min(w, h) * 0.04);

  return {
    version: 'mock-v1',
    mode: 'mock',
    createdAt: new Date().toISOString(),
    regions: {
      title: { x: pad, y: pad, width: w * 0.5, height: h * 0.16 },
      subtitle: { x: pad, y: h * 0.2, width: w * 0.52, height: h * 0.12 },
      logo: { x: w - w * 0.18 - pad, y: pad, width: w * 0.18, height: h * 0.13 },
      cta: { x: pad, y: h * 0.72, width: w * 0.35, height: h * 0.13 },
      copyright: { x: pad, y: h * 0.88, width: w * 0.45, height: h * 0.09 },
      subject: { x: w * 0.5, y: h * 0.12, width: w * 0.45, height: h * 0.72 },
      background: { x: 0, y: 0, width: w, height: h },
      decor: { x: w * 0.7, y: h * 0.02, width: w * 0.28, height: h * 0.22 }
    }
  };
}

function renderFromAnalysis({ size, imageEl, analysisResult }) {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');

  const { regions } = analysisResult;

  drawExpandedBackground(ctx, imageEl, sanitizeRect(regions.background, imageEl), size);

  const layout = getLayout(size);
  drawPreservedRegion(ctx, imageEl, sanitizeRect(regions.subject, imageEl), layout.visual, 0.95);

  ['title', 'subtitle', 'logo', 'cta', 'copyright'].forEach((key) => {
    drawPreservedRegion(ctx, imageEl, sanitizeRect(regions[key], imageEl), layout.textZones[key], 1);
  });

  drawPreservedRegion(ctx, imageEl, sanitizeRect(regions.decor, imageEl), layout.decor, 1);

  return canvas.toDataURL('image/png');
}

function getLayout(size) {
  const isTopBottom = size.layout === 'top-bottom';

  if (!isTopBottom) {
    const leftW = size.width * 0.46;
    return {
      visual: { x: leftW, y: 0, width: size.width - leftW, height: size.height },
      textZones: {
        title: { x: 28, y: 24, width: leftW - 56, height: size.height * 0.22 },
        subtitle: { x: 28, y: size.height * 0.25, width: leftW - 56, height: size.height * 0.16 },
        logo: { x: 28, y: size.height * 0.43, width: leftW * 0.42, height: size.height * 0.2 },
        cta: { x: 28, y: size.height * 0.68, width: leftW - 56, height: size.height * 0.14 },
        copyright: { x: 28, y: size.height * 0.84, width: leftW - 56, height: size.height * 0.12 }
      },
      decor: { x: size.width - size.width * 0.24, y: 18, width: size.width * 0.2, height: size.height * 0.22 }
    };
  }

  const textH = size.height * 0.34;
  return {
    visual: { x: 0, y: textH, width: size.width, height: size.height - textH },
    textZones: {
      title: { x: 36, y: 28, width: size.width - 72, height: textH * 0.22 },
      subtitle: { x: 36, y: textH * 0.24, width: size.width - 72, height: textH * 0.16 },
      logo: { x: 36, y: textH * 0.42, width: size.width * 0.24, height: textH * 0.2 },
      cta: { x: 36, y: textH * 0.67, width: size.width * 0.5, height: textH * 0.14 },
      copyright: { x: 36, y: textH * 0.82, width: size.width * 0.6, height: textH * 0.12 }
    },
    decor: { x: size.width - size.width * 0.2, y: textH * 0.48, width: size.width * 0.16, height: textH * 0.34 }
  };
}

function drawExpandedBackground(ctx, imageEl, sourceRect, size) {
  const source = cropToCanvas(imageEl, sourceRect);
  const fit = Math.max(size.width / source.width, size.height / source.height);
  const w = source.width * fit;
  const h = source.height * fit;
  const x = (size.width - w) / 2;
  const y = (size.height - h) / 2;

  ctx.filter = 'blur(30px) saturate(1.08)';
  ctx.drawImage(source, x, y, w, h);
  ctx.filter = 'none';

  ctx.globalAlpha = 0.55;
  ctx.drawImage(source, x, y, w, h);
  ctx.globalAlpha = 1;
}

function drawPreservedRegion(ctx, imageEl, sourceRect, targetRect, fillRate = 1) {
  const source = cropToCanvas(imageEl, sourceRect);
  const scale = Math.min(targetRect.width / source.width, targetRect.height / source.height) * fillRate;
  const w = source.width * scale;
  const h = source.height * scale;
  const x = targetRect.x + (targetRect.width - w) / 2;
  const y = targetRect.y + (targetRect.height - h) / 2;
  ctx.drawImage(source, x, y, w, h);
}

function sanitizeRect(rect, image) {
  return {
    x: Math.max(0, Math.min(rect.x, image.width - 1)),
    y: Math.max(0, Math.min(rect.y, image.height - 1)),
    width: Math.max(1, Math.min(rect.width, image.width)),
    height: Math.max(1, Math.min(rect.height, image.height))
  };
}

function cropToCanvas(imageEl, rect) {
  const c = document.createElement('canvas');
  c.width = Math.round(rect.width);
  c.height = Math.round(rect.height);
  c.getContext('2d').drawImage(imageEl, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
  return c;
}

export default App;

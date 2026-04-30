import { useMemo, useRef, useState } from 'react';

const SIZE_OPTIONS = [
  { key: '608x344', width: 608, height: 344, label: '608×344 banner', layout: '左右结构' },
  { key: '1400x1400', width: 1400, height: 1400, label: '1400×1400 banner', layout: '上下结构' },
  { key: '1440x617', width: 1440, height: 617, label: '1440×617 banner', layout: '左右结构' },
  { key: '1440x2864', width: 1440, height: 2864, label: '1440×2864 海报', layout: '上下结构' }
];

const FOCUS_MAP = {
  '左上': { x: 0, y: 0 }, '上中': { x: 0.5, y: 0 }, '右上': { x: 1, y: 0 },
  '左中': { x: 0, y: 0.5 }, '中心': { x: 0.5, y: 0.5 }, '右中': { x: 1, y: 0.5 },
  '左下': { x: 0, y: 1 }, '下中': { x: 0.5, y: 1 }, '右下': { x: 1, y: 1 }
};

const defaultTargets = SIZE_OPTIONS.map((s) => s.key);
const cardCls = 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm';

function splitLines(value) {
  return value.split('\n').map((v) => v.trim()).filter(Boolean);
}

export default function App() {
  const [sourceType, setSourceType] = useState('节日运营头图');
  const [targets, setTargets] = useState(defaultTargets);
  const [fitMode, setFitMode] = useState('cover');
  const [focus, setFocus] = useState('中心');
  const [scalePct, setScalePct] = useState(100);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [bgColor, setBgColor] = useState('#f1f5f9');
  const [blurBg, setBlurBg] = useState(true);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [otherCopy, setOtherCopy] = useState('');
  const [protectedElements, setProtectedElements] = useState('中秋主标题\n品牌Logo\n核心产品主体\n月亮主视觉');
  const [editableElements, setEditableElements] = useState('背景云层\n装饰灯笼\n边缘光效\n氛围粒子');

  const [imagePreview, setImagePreview] = useState('');
  const [imageElement, setImageElement] = useState(null);
  const [renders, setRenders] = useState({});
  const canvasRefs = useRef({});

  const selectedOptions = SIZE_OPTIONS.filter((item) => targets.includes(item.key));

  const output = useMemo(() => {
    const strategyRows = selectedOptions.map((size) => {
      if (size.key === '1440x2864') {
        return `${size.key}｜${size.layout}｜上方2/3用于文字信息编排，下方1/3保留主体与按钮区域，保持上下结构。`;
      }
      if (size.layout === '左右结构') {
        return `${size.key}｜${size.layout}｜左侧文字区、右侧主体图，保持主视觉素材文字不变，仅做裁切与背景补齐。`;
      }
      return `${size.key}｜${size.layout}｜上方文字区、下方主体图，保持原图文本内容，不做AI改写。`;
    });

    return {
      diagnosis: [
        `原图类型：${sourceType}。`,
        '先拆解主视觉结构：文字层、主体层、品牌层、氛围层。',
        '图片生成以 Canvas 适配为主，不重写文案、不重新生成文字。'
      ],
      strategyRows,
      prompt: [
        '保持原主视觉风格一致，仅延展背景，不修改原图文字。',
        '禁止新增任何文字与乱码，禁止替换主体与Logo。',
        `输出尺寸：${selectedOptions.map((s) => `${s.width}x${s.height}`).join(' / ')}`
      ],
      textRules: [
        '主副标题与其他文案逐字保留，不增删改。',
        '若需后续设计软件加字，仅做位置重排，不更改内容。',
        '1440x2864 严格遵循上2/3文案区、下1/3主体与按钮区。'
      ],
      qa: [
        '检查导出 PNG 尺寸是否精确匹配目标像素。',
        '检查主体是否拉伸变形、文字是否被意外裁断。',
        '检查 contain 模式下留白/模糊背景是否自然衔接。'
      ]
    };
  }, [selectedOptions, sourceType]);

  const toggleTarget = (key) => {
    setTargets((prev) => prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]);
  };

  const loadImage = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setImageElement(img);
        setImagePreview(reader.result);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const drawToCanvas = (size) => {
    if (!imageElement) return null;
    const canvas = canvasRefs.current[size.key];
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const { width: cw, height: ch } = size;
    canvas.width = cw;
    canvas.height = ch;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cw, ch);

    const { width: iw, height: ih } = imageElement;
    const baseScale = fitMode === 'cover' ? Math.max(cw / iw, ch / ih) : Math.min(cw / iw, ch / ih);
    const actualScale = baseScale * (scalePct / 100);
    const drawW = iw * actualScale;
    const drawH = ih * actualScale;
    const anchor = FOCUS_MAP[focus];
    const x = (cw - drawW) * anchor.x + offsetX;
    const y = (ch - drawH) * anchor.y + offsetY;

    if (fitMode === 'contain' && blurBg) {
      ctx.save();
      ctx.filter = 'blur(22px)';
      const bgScale = Math.max(cw / iw, ch / ih) * 1.08;
      const bw = iw * bgScale;
      const bh = ih * bgScale;
      const bx = (cw - bw) / 2;
      const by = (ch - bh) / 2;
      ctx.globalAlpha = 0.55;
      ctx.drawImage(imageElement, bx, by, bw, bh);
      ctx.restore();
    }

    ctx.drawImage(imageElement, x, y, drawW, drawH);
    return canvas.toDataURL('image/png');
  };

  const generateAll = () => {
    if (!imageElement || selectedOptions.length === 0) return;
    const next = {};
    selectedOptions.forEach((size) => {
      const dataUrl = drawToCanvas(size);
      if (dataUrl) next[size.key] = dataUrl;
    });
    setRenders(next);
  };

  const regenerateOne = (sizeKey) => {
    const size = SIZE_OPTIONS.find((s) => s.key === sizeKey);
    if (!size) return;
    const dataUrl = drawToCanvas(size);
    if (!dataUrl) return;
    setRenders((prev) => ({ ...prev, [sizeKey]: dataUrl }));
  };

  const downloadPng = (sizeKey) => {
    const dataUrl = renders[sizeKey];
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `resize-${sizeKey}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className={cardCls}>
          <h1 className="text-2xl font-semibold">延展尺寸工具</h1>
          <p className="mt-1 text-sm text-slate-600">上传主视觉后，用 Canvas 直接生成多尺寸延展图预览并导出 PNG。</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className={`${cardCls} space-y-4`}>
            <h2 className="text-lg font-semibold">输入设置</h2>
            <input type="file" accept="image/*" className="block w-full rounded-lg border border-slate-300 p-2 text-sm"
              onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])} />
            {imagePreview && <img src={imagePreview} alt="主视觉预览" className="h-40 w-full rounded-lg border object-cover" />}

            <div className="space-y-2">
              <label className="text-sm font-medium">目标尺寸（多选）</label>
              {SIZE_OPTIONS.map((option) => (
                <label key={option.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={targets.includes(option.key)} onChange={() => toggleTarget(option.key)} />
                  {option.label}（{option.layout}）
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">适配模式
                <select value={fitMode} onChange={(e) => setFitMode(e.target.value)} className="mt-1 w-full rounded border border-slate-300 p-2">
                  <option value="cover">Cover 裁切填充</option>
                  <option value="contain">Contain 完整保留</option>
                </select>
              </label>
              <label className="text-sm">焦点位置
                <select value={focus} onChange={(e) => setFocus(e.target.value)} className="mt-1 w-full rounded border border-slate-300 p-2">
                  {Object.keys(FOCUS_MAP).map((key) => <option key={key}>{key}</option>)}
                </select>
              </label>
            </div>

            <label className="text-sm">缩放：{scalePct}%
              <input type="range" min="80" max="160" value={scalePct} onChange={(e) => setScalePct(Number(e.target.value))} className="w-full" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">X 位移
                <input type="number" value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} className="mt-1 w-full rounded border border-slate-300 p-2" />
              </label>
              <label className="text-sm">Y 位移
                <input type="number" value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} className="mt-1 w-full rounded border border-slate-300 p-2" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">背景色
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="mt-1 h-10 w-full rounded border border-slate-300 p-1" />
              </label>
              <label className="flex items-center gap-2 pt-7 text-sm">
                <input type="checkbox" checked={blurBg} onChange={(e) => setBlurBg(e.target.checked)} disabled={fitMode !== 'contain'} />
                contain 时启用模糊背景填充
              </label>
            </div>

            <button onClick={generateAll} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">生成延展图</button>
          </section>

          <section className={`${cardCls} space-y-3`}>
            <h2 className="text-lg font-semibold">尺寸图预览</h2>
            {!imageElement && <p className="text-sm text-slate-500">请先上传主视觉并点击“生成延展图”。</p>}
            <div className="space-y-3">
              {selectedOptions.map((size) => (
                <article key={size.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold">{size.label}</h3>
                      <p className="text-xs text-slate-500">{size.width}×{size.height} · {size.layout}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => regenerateOne(size.key)} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs">重新生成</button>
                      <button onClick={() => downloadPng(size.key)} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs">下载 PNG</button>
                    </div>
                  </div>
                  <div className="rounded-md border bg-white p-2">
                    <canvas ref={(el) => { canvasRefs.current[size.key] = el; }} className="w-full rounded bg-slate-100" style={{ aspectRatio: `${size.width} / ${size.height}` }} />
                    {!renders[size.key] && <p className="pt-2 text-xs text-slate-500">尚未生成，点击“生成延展图”。</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className={`${cardCls} space-y-3`}>
          <h2 className="text-lg font-semibold">文字策略辅助模块（保留）</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={sourceType} onChange={(e) => setSourceType(e.target.value)} className="rounded border border-slate-300 p-2" placeholder="原图类型" />
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded border border-slate-300 p-2" placeholder="主标题" />
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="rounded border border-slate-300 p-2" placeholder="副标题" />
            <textarea value={otherCopy} onChange={(e) => setOtherCopy(e.target.value)} className="rounded border border-slate-300 p-2" placeholder="其他文案" />
            <textarea value={protectedElements} onChange={(e) => setProtectedElements(e.target.value)} className="rounded border border-slate-300 p-2" placeholder="保护元素" />
            <textarea value={editableElements} onChange={(e) => setEditableElements(e.target.value)} className="rounded border border-slate-300 p-2" placeholder="可编辑元素" />
          </div>
          <OutputBlock title="原始视觉诊断" text={output.diagnosis.join('\n')} />
          <OutputBlock title="多尺寸策略表" text={output.strategyRows.join('\n')} />
          <OutputBlock title="AI 扩图 Prompt" text={output.prompt.join('\n')} />
          <OutputBlock title="文字重排规则" text={output.textRules.join('\n')} />
          <OutputBlock title="QA 检查清单" text={output.qa.join('\n')} />
        </section>
      </div>
    </div>
  );
}

function OutputBlock({ title, text }) {
  const copy = async () => navigator.clipboard.writeText(text);
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button onClick={copy} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs">复制</button>
      </div>
      <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-700">{text}</pre>
    </article>
  );
}

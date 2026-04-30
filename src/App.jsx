import { useMemo, useState } from 'react';

const SIZE_OPTIONS = [
  { key: '608x344', label: '608×344 banner（左文右图）', layout: '左文右图' },
  { key: '1400x1400', label: '1400×1400 banner（上文下图）', layout: '上文下图' },
  { key: '1440x617', label: '1440×617 banner（左文右图）', layout: '左文右图' },
  { key: '1440x2864', label: '1440×2864 海报（上文下图）', layout: '上文下图' }
];

const defaultChecked = ['608x344', '1400x1400', '1440x617', '1440x2864'];

const sectionCard = 'rounded-xl border border-slate-200 bg-white p-5 shadow-panel';

function splitLines(value) {
  return value.split('\n').map((v) => v.trim()).filter(Boolean);
}

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [sourceType, setSourceType] = useState('节日运营头图');
  const [targets, setTargets] = useState(defaultChecked);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [otherCopy, setOtherCopy] = useState('');
  const [protectedElements, setProtectedElements] = useState('中秋主标题\n品牌Logo\n核心产品主体\n月亮主视觉');
  const [editableElements, setEditableElements] = useState('背景云层\n装饰灯笼\n边缘光效\n氛围粒子');
  const [imagePreview, setImagePreview] = useState('');
  const [generated, setGenerated] = useState(false);

  const selectedOptions = SIZE_OPTIONS.filter((item) => targets.includes(item.key));

  const output = useMemo(() => {
    const protectedList = splitLines(protectedElements);
    const editableList = splitLines(editableElements);
    const copyLines = [title, subtitle, ...splitLines(otherCopy)].filter(Boolean);

    const strategyRows = selectedOptions.map((size) => {
      if (size.key === '1440x2864') {
        return {
          ...size,
          strategy:
            '采用上文下图。上部约66%区域用于完整文案层级，保持大标题-副标题-补充信息垂直栈；下部约34%保留主体画面与特定按钮，按钮固定底部安全区中心，四周留足触达边距。'
        };
      }
      if (size.layout === '左文右图') {
        return {
          ...size,
          strategy:
            '左侧建立文字列（约38%-45%宽），右侧保留主视觉主体（约55%-62%宽）；通过延展背景填充横向空间，禁止挤压主体比例。'
        };
      }
      return {
        ...size,
        strategy:
          '上部建立文本信息区（约35%-42%高），下部保留主体视觉（约58%-65%高）；文本区使用纯净留白或弱纹理底，确保可读性。'
      };
    });

    return {
      diagnosis: [
        `原图类型：${sourceType}。`,
        '主视觉结构建议拆解：主标题层、品牌识别层、主体物层、节日氛围层、行动引导层。',
        '视觉重心优先保持在主体物+月亮关系区，不改动主光源方向与色温。',
        '文字必须独立重排，不允许在AI扩图中直接生成新文字。'
      ],
      strategyRows,
      prompt: [
        '【统一扩图主提示词】',
        '保持中秋节庆视觉风格一致，延展背景而非重绘主体；保留原有主体、Logo区域、产品形态、月亮与主光影关系；维持原配色、材质细节、景深与颗粒感；仅补充连续的天空/云层/装饰氛围。',
        '禁止生成任何新文字、乱码、变形字符；禁止替换品牌标识；禁止改变主体结构比例；禁止新增不相关物件。',
        `输出尺寸：${selectedOptions.map((s) => s.key).join('、')}。`,
        '【按尺寸附加指令】',
        ...strategyRows.map((row) => `${row.key}：${row.layout}，${row.strategy}`)
      ],
      textRules: [
        '文案不得改写：主标题、副标题、其他文案逐字使用输入内容。',
        '层级顺序：主标题 > 副标题 > 其他文案 > CTA/按钮文案。',
        '左文右图版式：文字区左对齐，标题行长控制在8-14个中文字符视觉宽度。',
        '上文下图版式：标题置于上半区中轴或左中轴，段落间距按字号的0.6-0.9倍递进。',
        '1440x2864海报：上方2/3承载文字编排，下方1/3用于主体与特定按钮，按钮不得漂浮到中区。',
        '最小安全边距建议：四边≥画布宽度的4%，按钮区底边≥6%。'
      ],
      qa: [
        '核对文本100%一致（不增删、不改字、不改标点）。',
        '检查Logo、主体、月亮等保护元素是否完整且无变形。',
        '检查扩图区域是否存在断层、重复纹理或不自然拼接。',
        '检查4个尺寸版式是否符合指定结构（左文右图 / 上文下图）。',
        '检查1440x2864是否严格满足上2/3文字区、下1/3按钮区。',
        '检查按钮可点击识别度：对比充分、边距足够、无遮挡。',
        '导出前检查分辨率与尺寸精确匹配，不得近似。'
      ],
      protectedList,
      editableList,
      copyLines
    };
  }, [editableElements, protectedElements, selectedOptions, sourceType, subtitle, title, otherCopy]);

  const toggleTarget = (key) => {
    setTargets((prev) => prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]);
  };

  const copyText = async (text) => navigator.clipboard.writeText(text);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className={sectionCard}>
          <h1 className="text-2xl font-semibold">延展尺寸工具</h1>
          <p className="mt-1 text-sm text-slate-600">基于单张主视觉，输出多尺寸延展策略、AI 扩图提示词与文本重排规范（不自动改写文案）。</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className={`${sectionCard} space-y-4`}>
            <h2 className="text-lg font-semibold">输入区域</h2>
            <input type="file" accept="image/*" className="block w-full rounded-lg border border-slate-300 p-2 text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }} />
            {imagePreview && <img src={imagePreview} alt="预览" className="h-44 w-full rounded-lg border object-cover" />}
            <input value={sourceType} onChange={(e) => setSourceType(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2" placeholder="原图类型" />
            <div>
              <p className="mb-2 text-sm font-medium">目标尺寸（多选）</p>
              <div className="space-y-2">
                {SIZE_OPTIONS.map((option) => (
                  <label key={option.key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={targets.includes(option.key)} onChange={() => toggleTarget(option.key)} />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2" placeholder="主标题" />
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2" placeholder="副标题" />
            <textarea value={otherCopy} onChange={(e) => setOtherCopy(e.target.value)} className="h-24 w-full rounded-lg border border-slate-300 p-2" placeholder="其他文案（每行一条）" />
            <textarea value={protectedElements} onChange={(e) => setProtectedElements(e.target.value)} className="h-24 w-full rounded-lg border border-slate-300 p-2" placeholder="保护元素" />
            <textarea value={editableElements} onChange={(e) => setEditableElements(e.target.value)} className="h-24 w-full rounded-lg border border-slate-300 p-2" placeholder="可编辑元素" />
            <button onClick={() => setGenerated(true)} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">生成延展策略</button>
          </section>

          <section className={`${sectionCard} space-y-4`}>
            <h2 className="text-lg font-semibold">输出区域</h2>
            {!generated && <p className="text-sm text-slate-500">填写左侧内容后点击“生成延展策略”。</p>}
            {generated && (
              <>
                <OutputBlock title="原始视觉诊断" text={output.diagnosis.join('\n')} onCopy={copyText} />
                <OutputBlock title="多尺寸策略表" text={output.strategyRows.map((r) => `${r.key}｜${r.layout}｜${r.strategy}`).join('\n')} onCopy={copyText} />
                <OutputBlock title="AI 扩图 Prompt" text={output.prompt.join('\n')} onCopy={copyText} />
                <OutputBlock title="文字重排规则" text={output.textRules.join('\n')} onCopy={copyText} />
                <OutputBlock title="QA 检查清单" text={output.qa.join('\n')} onCopy={copyText} />
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function OutputBlock({ title, text, onCopy }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button onClick={() => onCopy(text)} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs">复制</button>
      </div>
      <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-700">{text}</pre>
    </article>
  );
}

export default App;

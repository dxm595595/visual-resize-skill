import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

if (!process.env.OPENAI_API_KEY) {
  console.warn('Missing OPENAI_API_KEY in environment. /api/analyze-image will fail until it is set.');
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ANALYZE_PROMPT = `你是一个广告头图版式分析助手。请读取给定图片并输出严格 JSON（不要 markdown，不要额外解释）。

必须返回以下字段：
- imageWidth, imageHeight
- titleRegion, subtitleRegion, logoRegion, ctaRegion, copyrightRegion, subjectRegion, backgroundRegion
- decorationRegions（数组）
- layoutSuggestion: { mainComposition, visualStyle, extensionNotes }

每个 Region 结构：{ x, y, width, height, confidence }

规则：
1) 坐标系原点在左上角；单位是像素；必须基于原图尺寸。
2) x,y,width,height >= 0，且区域不能超出图像边界。
3) 未识别到某区域时，仍返回该字段，值为 { x:0, y:0, width:0, height:0, confidence:0 }。
4) backgroundRegion 应尽量覆盖完整背景；decorationRegions 可为空数组。
5) confidence 范围 0~1。
6) 输出必须是可 JSON.parse 的对象。`;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Missing image file. Please upload with field name "image".' });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server misconfigured: missing OPENAI_API_KEY.' });
    }

    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/png';

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: ANALYZE_PROMPT },
            {
              type: 'input_image',
              image_url: `data:${mimeType};base64,${base64}`
            }
          ]
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'image_layout_analysis',
          schema: {
            type: 'object',
            required: [
              'imageWidth','imageHeight','titleRegion','subtitleRegion','logoRegion','ctaRegion','copyrightRegion','subjectRegion','backgroundRegion','decorationRegions','layoutSuggestion'
            ],
            properties: {
              imageWidth: { type: 'number' },
              imageHeight: { type: 'number' },
              titleRegion: { $ref: '#/$defs/region' },
              subtitleRegion: { $ref: '#/$defs/region' },
              logoRegion: { $ref: '#/$defs/region' },
              ctaRegion: { $ref: '#/$defs/region' },
              copyrightRegion: { $ref: '#/$defs/region' },
              subjectRegion: { $ref: '#/$defs/region' },
              backgroundRegion: { $ref: '#/$defs/region' },
              decorationRegions: { type: 'array', items: { $ref: '#/$defs/region' } },
              layoutSuggestion: {
                type: 'object',
                required: ['mainComposition', 'visualStyle', 'extensionNotes'],
                properties: {
                  mainComposition: { type: 'string' },
                  visualStyle: { type: 'string' },
                  extensionNotes: { type: 'string' }
                },
                additionalProperties: false
              }
            },
            additionalProperties: false,
            $defs: {
              region: {
                type: 'object',
                required: ['x', 'y', 'width', 'height', 'confidence'],
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                  width: { type: 'number' },
                  height: { type: 'number' },
                  confidence: { type: 'number' }
                },
                additionalProperties: false
              }
            }
          }
        }
      }
    });

    const jsonText = response.output_text;
    return res.json(JSON.parse(jsonText));
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Failed to analyze image with AI.',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

app.listen(port, () => {
  console.log(`AI analyze server listening on http://localhost:${port}`);
});

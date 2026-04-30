{\rtf1\ansi\ansicpg936\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ---\
name: visual-resize-extension\
description: Use this skill when the user provides a finished visual design, campaign header, poster, KV, banner, or social media graphic and wants to extend it into multiple sizes while preserving text accuracy, subject integrity, layout hierarchy, and brand consistency. Do not use this skill for creating a design from scratch.\
---\
\
# Visual Resize Extension Skill\
\
## Purpose\
\
This skill converts one finished main visual into multiple target-size adaptation plans.\
\
The goal is not to redesign the visual from scratch. The goal is to preserve the original design language while adapting it to new proportions, platforms, and production formats.\
\
## Core Principle\
\
Never rely on image generation to redraw text.\
\
Text must be extracted, manually confirmed, or re-entered before adaptation. The image model may be used for background extension, atmosphere continuation, and non-critical decorative filling, but not for final text rendering.\
\
## Input Required\
\
When using this skill, collect or infer the following:\
\
1. Source visual type\
   - Campaign header\
   - Brand KV\
   - Education poster\
   - Festival visual\
   - Product banner\
   - Offline display board\
   - Social media cover\
\
2. Source image proportion\
   - Horizontal\
   - Vertical\
   - Square\
   - Unknown\
\
3. Target sizes\
   - 1:1 social post\
   - 3:4 social cover\
   - 4:5 feed post\
   - 9:16 story poster\
   - 16:9 banner\
   - A2 vertical poster\
   - 600 \'d7 900 mm display board\
   - Custom size\
\
4. Protected elements\
   - Logo\
   - Main title\
   - Subtitle\
   - CTA\
   - Product\
   - Character\
   - Brand mascot\
   - Legal text\
   - QR code\
\
5. Editable elements\
   - Background\
   - Decorative graphics\
   - Secondary atmosphere elements\
   - Cropping area\
   - Empty space\
   - Supporting patterns\
\
6. Text content\
   - Must be confirmed by the user or extracted by OCR.\
   - Do not invent, rewrite, simplify, or translate text unless explicitly requested.\
\
## Workflow\
\
### Step 1: Analyze the source visual\
\
Identify:\
\
- Main subject\
- Visual center\
- Text hierarchy\
- Brand area\
- Safe margins\
- Background extension potential\
- Elements that cannot be cropped\
- Elements that can be moved or reduced\
\
Classify the source visual into one of these layout types:\
\
1. Center subject + surrounding text\
2. Left text + right subject\
3. Right text + left subject\
4. Top title + bottom subject\
5. Full-background atmosphere + floating text\
6. Product-centered commercial layout\
7. Character-centered campaign layout\
\
### Step 2: Confirm text separately\
\
Before generating any resized output, separate text into:\
\
- Main title\
- Subtitle\
- Supporting copy\
- Time / price / location\
- CTA\
- Logo text\
- QR code caption\
- Legal note\
\
Text must be treated as editable layout content, not as part of the generated image.\
\
### Step 3: Define adaptation strategy\
\
For each target size, decide:\
\
- Whether to crop, expand, or recompose\
- Whether the subject should remain centered or move\
- Whether text should stay in the same area or be rebuilt\
- Whether decorative elements should be reduced\
- Whether background extension is needed\
- Whether additional safe margin is required\
\
### Step 4: Generate layout instructions\
\
For each target size, output:\
\
1. Canvas size\
2. Layout structure\
3. Main subject position\
4. Text position\
5. Logo position\
6. Background handling\
7. Elements to remove, simplify, or preserve\
8. Production notes\
\
### Step 5: Generate AI image-editing prompt\
\
The prompt must instruct the image model to:\
\
- Preserve the main subject\
- Preserve the original style and material\
- Extend only the background if needed\
- Avoid changing text\
- Avoid inventing new elements\
- Avoid altering logo or character identity\
- Keep lighting, color, material, and atmosphere consistent\
\
### Step 6: Generate text reconstruction instruction\
\
After background and image adaptation, text must be manually or programmatically re-added.\
\
Specify:\
\
- Font hierarchy\
- Alignment\
- Recommended size relationship\
- Spacing\
- Safe area\
- Contrast requirement\
- Export clarity requirement\
\
### Step 7: Final QA checklist\
\
Before delivery, check:\
\
- Text accuracy\
- No distorted characters\
- No missing strokes\
- Logo integrity\
- Main subject not stretched\
- Face / hand / product not deformed\
- Important content inside safe area\
- Correct target size\
- Correct resolution\
- Correct export format\
- Enough bleed for print formats\
- No unintended extra elements\
\
## Output Format\
\
When this skill is used, always output in this structure:\
\
1. Source Visual Diagnosis\
2. Protected Elements\
3. Editable Elements\
4. Target Size Strategy Table\
5. AI Background Extension Prompts\
6. Text Reconstruction Rules\
7. Final QA Checklist\
8. Designer Manual Adjustment Notes\
\
## Rules\
\
- Do not claim the output is fully automatic if manual text confirmation is required.\
- Do not promise zero text errors when only a flat image is provided.\
- Do not modify the original copywriting unless requested.\
- Do not recommend direct full-image regeneration when text accuracy matters.\
- Always separate image extension from text reconstruction.\
- Always prioritize layout readability over decorative completeness.\
- Always preserve the original design language.}
<div align="center">

# 🖋️ text2handwriting.me

<img src="public/images/logo.png" alt="text2handwriting.me Logo" width="140" />

### Turn your own text into print-ready handwritten-style pages

[![Live Site](https://img.shields.io/badge/Live-text2handwriting.me-F38020?style=for-the-badge&logo=cloudflare)](https://text2handwriting.me)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/bipin-vishwakarma/text2handwriting.me)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite 7](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**[Key Features](#-key-features)** • **[Document Importer](#-1-multi-format-document-importer--drag-and-drop)** • **[Markup Cheat Sheet](#-markup--syntax-cheat-sheet)** • **[Camera & Physics](#-6-3d-camera-physics--photo-effects)** • **[Quick Start](#-quick-start)** • **[Deployment](#-deployment-to-cloudflare-pages)**

</div>

---

## 🌟 What is text2handwriting.me?

**text2handwriting.me** is a browser-based editor for formatting your own text, permitted assignments, and study notes as handwritten-style pages. Customize fonts, paper, ink and spacing, then review the preview before exporting. This is digital formatting, not proof of human authorship.

### Try it and learn more

- [Open the editor](https://text2handwriting.me/editor/) — create and preview a layout.
- [Pricing](https://text2handwriting.me/pricing/) — previewing and paid exports are separate; check the current price before purchasing.
- [Typed text to handwritten notes](https://text2handwriting.me/typed-text-to-handwritten-notes/)
- [Practical record formatting guide](https://text2handwriting.me/practical-record-formatting-guide/)
- [Print-ready handwritten PDF checklist](https://text2handwriting.me/print-ready-handwritten-pdf-guide/)
- [Support](https://text2handwriting.me/support/)

Use only content you have permission to format and follow your institution's submission rules.

Unlike traditional handwriting generators that simply render flat digital fonts in a rigid grid, text2handwriting.me reproduces the subtle physical flaws, optical dynamics, and analog paper textures of real-world notes:
- **Hand Dynamics**: Letter micro-jitter, pen pressure variance, baseline wobble, and progressive wrist fatigue.
- **Academic Notebook Elements**: Iconic pre-printed **Date & Page No.** header box, heading double-underlines, and wobbly hand-drawn formula boxes.
- **Smart Academic Layout**: Automated detection of question numbers, answers, roman numerals, and bullets positioned outside the red margin line.
- **Multi-Format Document Ingestion**: Instant client-side import for Microsoft Word (`.docx`), PDF (`.pdf`), Markdown (`.md`), Plain Text (`.txt`), RTF, and Image OCR.
- **Organic Corrections**: Procedural scratch-outs (wavy scribbles, blackouts, slashes) and handwritten caret (`^`) insertions.
- **Physical Environment**: 3D perspective camera angles, smartphone cast shadows, warm desk lamp lighting, and realistic paper creases.
- **Preview before purchase**: Draft and preview in the browser; paid exports require the checkout flow. Account and payment services are separate from local document rendering.

---

## ⚡ Key Features

### 📁 1. Multi-Format Document Importer & Drag-and-Drop
Seamlessly turn your digital assignments, lecture notes, or research papers directly into authentic handwritten notebook sheets:
- **Microsoft Word (`.docx`)**: Clean Markdown conversion preserving headers, questions, and bullet structures.
- **PDF Documents (`.pdf`)**: Coordinate-accurate multi-page text reconstruction with automatic OCR fallback for scanned sheets.
- **Markdown (`.md`, `.markdown`) & Plain Text (`.txt`)**: Instant parsing with intelligent header and bullet recognition.
- **Rich Text (`.rtf`)**: Native control-word stripping and clean formatting recovery.
- **Image OCR (`.png`, `.jpg`, `.jpeg`, `.webp`)**: Client-side optical character recognition via Tesseract.js.
- **Interactive Drag-and-Drop**: Drag any document directly onto the editor or into fullscreen Focus Mode to import instantly.

---

### 📅 2. Authentic Student Notebook Header Box & Double Top Rule
- **Iconic Indian Notebook Header**: Multi-compartment coral/rose printed box in the top-right corner, matching authentic **Youva (Navneet), Classmate, Spellar & Sundaram** student notebooks.
- **Natural Paper Blending**: Renders directly into the paper fibers with transparent background so room lighting, phone shadows, camera grain, and warmth realistically composite over the header box.
- **Day of Week Tracker**: Includes `M T W T F S S` day initials with an organic hand-drawn blue ballpoint circle around the active day.
- **Dynamic Page Numbers & Date**: Automatically numbers each page (`PAGE NO: 01`, `02`, `03`...) using the chosen handwriting style and pen ink, with customizable date.
- **Double Red Top Header Rule**: Authentic dual red lines across the top header margin.
- **Full Fidelity Export**: Preserved pixel-for-pixel inside exported PDFs and Ultra-HD ZIP images.

---

### 🌀 3. 30-Coil Twin-Wire Spiral Binding & Reverse-Page Ink Ghosting
- **Full-Page 30-Loop Metallic Coils**: Procedural silver dual coils spanning the entire 1131px page height from top header rule to bottom margin.
- **Smooth Spine Curvature**: Naturally curved wire loops with realistic depth, specular highlights, dark shadow casting, and punched holes.
- **Recto / Verso Parity**: Automatically mirrors spiral binding orientation across pages (odd pages bound on left margin, flipped even pages bound on right margin).
- **Reverse-Page Ink Ghosting**: Simulates genuine 65 GSM Indian notebook paper where faint, blurred handwriting from the reverse side shines through with `mix-blend-mode: multiply` and customizable opacity (4%–28%).

---

### ⚖️ 4. 2-Column Comparison & Differentiation Tables
- **Comparison Syntax**: Format side-by-side differentiations using `|| Advantage | Disadvantage ||` or `[compare]` blocks.
- **Hand-Drawn Divider**: Automatically draws an organic, pen-colored vertical divider line down the center of the ruled lines with natural micro-wobble.
- **Academic Formatting Toolbar**: 1-click heading chips for `[Q1.]`, `[Ans:]`, `[Advantages:]`, `[Limitations:]`, `[Applications:]`, and `[Conclusion:]`, plus automatic typing conversion of `->` to `→`.

---

### 📐 5. Smart Margin Indexing Engine
Simulates the authentic way students and researchers write notes and exams on ruled margin paper:
- **Autonomous Margin Detection**: Identifies prefixes such as:
  - **Questions & Answers**: `Q1.`, `Q.2`, `Ans:`, `Answer:`, `Solution:`, `Note:`
  - **Numeric & Alphabetic Subsections**: `1.`, `(a)`, `b)`, `IV.`, `(iii)`
  - **Academic Steps**: `Step 1:`, `Case A:`, `Ex. 3:`
  - **Bulleted Pointers**: `•`, `-`, `*`, `→`
- **Authentic Alignment**: Positioned dynamically to the left of the vertical red margin line, perfectly baseline-aligned with the accompanying handwriting.
- **Smart Toggle**: Can be enabled or disabled with a single click in Paper Settings.

---

### 📸 6. 3D Camera Physics & Photo Effects
- **True 3D Spatial Angles**: Rotates notebook pages in 3D space (`perspective(1000px)`, `rotateX`, `rotateY`, and `scale`) mimicking high-angle smartphone camera snapshots.
- **Random Angle Generator**: One-click procedural angle generator that rolls authentic hand-held phone camera rotations ($0.5^\circ - 3.5^\circ$) with tilt jitter per page.
- **Export-Preserved Non-Planar Geometry**: Renders the exact 3D tilt, aspect ratio, and perspective into exported PDFs and Ultra-HD PNG/JPEGs.
- **Smartphone Silhouette Shadow**: Realistic soft-edged silhouette of a phone hovering over the notebook, with customizable angle ($0^\circ - 360^\circ$) and shadow density.
- **Lighting Environments**:
  - 🛋️ **Warm Desk Lamp**: Tungsten warm gradient with adjustable warmth slider.
  - ☀️ **Cool Daylight**: Natural window exposure lighting.
  - ⚡ **Camera Flash**: High-intensity central flash hotspot.
  - 📄 **Flat / Scanner**: Crisp document scan.

---

### ✂️ 7. Procedural Pen Scratch & Correction Engine
- **Multiple Strike Styles**:
  - 〰️ **Wavy Scribble**: Natural, looping cursive blackout loops.
  - ✍️ **Underline**: Organic pen line underneath the mistake.
  - ⬛ **Blackout**: Dense, heavy zig-zag pen obliteration.
  - ➖ **Single Strike**: A quick, hurried slash.
  - ⚡ **Zigzag** & ➰ **Coil**: Quick spiral or jagged scratches.
- **Handwritten Caret Insertion (`^`)**: Renders realistic caret marks with the corrected word handwritten directly above the line.
- **Customizable Correction Ink**: Choose **Match** (same pen color) or contrasting inks (**Red**, **Green**, **Purple**).
- **Progressive Writer Fatigue**: Subtly increases baseline drift, slant, and letter spacing towards the bottom of long pages.

---

### 📜 8. 9 Procedural Paper Creases & Folds
Real paper rarely stays completely flat. Choose from 9 authentic physical paper wear profiles:
1. **None**: Crisp, fresh printer paper.
2. **Horizontal Half Fold**: Center fold crease from folding an A4 sheet in half.
3. **Quarter Cross Fold**: 4-quadrant letter fold lines.
4. **Dog-Eared Corner**: Classic bent page corner.
5. **Diagonal Crease**: Hurried textbook bookmark angle fold.
6. **Subtle Wrinkle**: Soft, natural organic paper texture.
7. **Heavy Crease**: Distinct pressure fold lines.
8. **Crumpled & Flattened**: Deep textured distress pattern.
9. **Trifold Brochure**: Letter-style three-panel vertical folds.

---

### 🖋️ 9. Pen Presets & Realistic Papers
- **Pen Presets**:
  - 🖊️ **Blue Ballpoint** (`#1e40af`) — Classic student ballpoint
  - 🖋️ **Black Gel Pen** (`#111827`) — Deep dark ink
  - ✒️ **Royal Fountain** (`#1d4ed8`) — Parker royal blue
  - ✏️ **HB #2 Pencil** (`#4b5563`) — Graphite texture
  - 🔴 **Red Pen** (`#dc2626`) — Vibrant red ink
- **Paper Materials**:
  - 📓 **Indian Student Spiral (Youva / Classmate)** — Twin-wire coils with authentic red double header rule
  - 📝 **College Ruled (Red Margin)** — Classic 65px vertical red margin line
  - 📜 **Standard Blue Ruled** — Clean lined notebook paper
  - 📐 **Engineering Graph Paper** — Precision 24px grid paper
  - 📄 **Plain White Sheet** — Unlined printer paper
  - 📜 **Vintage Notepad** — Aged cream parchment sheet

---

### 🗂️ 10. 25+ Curated Authentic Handwriting Fonts
Loaded locally & via Google Fonts for instant, zero-latency rendering:
- **Indian Student Handwritings**: `Shantell Sans`, `Delius`, `Pangolin`, `Gochi Hand`, `Kalam`.
- **Organic Student Handwritings**: `David Reid`, `Garrett Moretz`, `Herbert Cooper`, `John Williams`, `Kevin Knowles`, `Royston Such`.
- **Classic Styles**: `Handwriting 1` through `Handwriting 14` (Clean Pen, Casual Slant, Neat Ballpoint, Fluid Cursive, Fast Flow, Loose Homework, Fine Nib, Quick Notes, etc.).
- **Casual Everyday Fonts**: `Cedarville Cursive`, `Homemade Apple`, `Indie Flower`, `Patrick Hand`, `Shadows Into Light`, `Reenie Beanie`.
- **Full Devnagari Support**: Hindi handwriting font included.

---

### 🖨️ 11. Multi-Page Live Export Preview
- **Pre-Export Inspection**: Scroll through all generated pages with all active 3D tilts, shadows, and creases rendered before downloading.
- **Ultra-HD Resolution**: Renders pages at crisp print resolutions (up to $2480 \times 3508$ pixels for A4).
- **Multi-Format Export**:
  - Single/Multi-page PDF document.
  - High-resolution JPEG/PNG ZIP archive.
- **Zero Login Wall**: No email signup, no Google login required.

---

## 📝 Markup & Syntax Cheat Sheet

| Effect | Syntax | Example | Description |
| :--- | :--- | :--- | :--- |
| **Double Underline** | `__text__` | `__Electromagnetic Induction__` | Organic dual-line heading underline |
| **Formula / Answer Box** | `[[text]]` | `[[e = -dΦ/dt]]` | Hand-drawn wobbly answer box |
| **2-Column Comparison** | `\|\| Left \| Right \|\|` | `\|\| RAM \| ROM \|\|` | Side-by-side columns with hand-drawn pen divider |
| **Arrow Symbol** | `->` | `Input -> Output` | Automatically transforms to `→` on typing |
| **Scratch-Out / Strike** | `~~text~~` | `~~incorrect~~` | Natural pen scratch-out over word |
| **Strike with Caret** | `~~word~~^fix` | `~~proeprties~~^properties` | Scratches out word and puts fix above |
| **Standalone Caret** | `^word^` or `^word` | `looked ^at the car` | Caret mark pointing up at inserted word |
| **Margin Question Marker** | `Q1.` or `Q.1` | `Q1. State Faraday's law` | Placed in the left margin area |
| **Margin Answer Tag** | `Ans:` or `Sol:` | `Ans: When magnetic flux changes...` | Placed in the left margin area |

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/bipin-vishwakarma/text2handwriting.me.git
cd text2handwriting.me
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## ☁️ Deployment to Cloudflare Pages

The production site is hosted on Cloudflare Pages at
[`text2handwriting.me`](https://text2handwriting.me). Build and deploy with:

```bash
npm run build
npx wrangler pages deploy dist --project-name text2handwriting
```

The `public/_headers` file supplies production security and caching headers.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern UI components & reactive hooks |
| **Vite 7** | Next-generation frontend tooling & lightning-fast HMR |
| **TypeScript 5.9** | Strict type safety with modern module resolution |
| **Tailwind CSS v4** | Modern CSS-first styling engine with high performance |
| **Mammoth.js** | Client-side Microsoft Word (`.docx`) extraction |
| **PDF.js (`pdfjs-dist`)** | Client-side PDF page extraction & layout reconstruction |
| **Tesseract.js** | Client-side Optical Character Recognition (OCR) |
| **Zustand** | Centralized reactive state management |
| **Framer Motion** | Fluid animations, drawers, and modal transitions |
| **modern-screenshot & jsPDF** | High-fidelity canvas capture and PDF generation |
| **JSZip** | Multi-image compression for batch export |
| **Lucide React** | Clean, accessible vector icons |

---

## 📁 Project Structure

```
text2handwriting.me/
├── public/
│   ├── fonts/           # 20+ locally loaded authentic handwriting fonts
│   ├── images/          # Assets, paper textures, and logos
│   ├── favicon.ico      # text2handwriting.me fountain-pen favicon
│   └── favicon.png      # text2handwriting.me high-res brand icon
├── src/
│   ├── components/
│   │   ├── HandwrittenWord.tsx     # Strikes, carets, double underlines, formula boxes
│   │   ├── CameraOverlay.tsx       # 3D lighting, creases, phone shadows, 30-coil spiral
│   │   ├── HumanErrorsControls.tsx # Sliders & toggles for human imperfections
│   │   ├── PenPresetSelector.tsx   # Pen ink presets palette
│   │   ├── ThumbnailBar.tsx        # Multi-page floating thumbnail navigation
│   │   ├── layout/                 # Navbar, footer, and page layouts
│   │   └── modals/                 # Export modal, creator modal, history dialog
│   ├── lib/                        # Zustand store & global state
│   ├── pages/                      # EditorPage studio, landing, and legal pages
│   └── utils/                      # Document import, tokenization, font metrics, shadows
├── vercel.json          # Legacy compatibility configuration
└── package.json
```

---

## 👨‍💻 Creator & Author

<div align="center">
  <img src="https://avatars.githubusercontent.com/u/151464007?v=4" alt="Bipin Vishwakarma" width="90" style="border-radius: 50%; border: 3px solid #3b82f6;" />
  <br />
  <h3>Bipin Vishwakarma</h3>
  <p><strong>Creator & Developer • text2handwriting.me</strong><br />
  Biomedical Engineering Student at <strong>UPES Dehradun</strong> with a minor in <strong>Artificial Intelligence</strong>. Passionate about creative tech, analog document realism, and building free, privacy-first tools for students and creators.</p>

  <a href="https://github.com/bipin-vishwakarma"><img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
  <a href="https://instagram.com/bipin_vishwakarma"><img src="https://img.shields.io/badge/Instagram-@bipin__vishwakarma-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a>
  <a href="https://www.linkedin.com/in/bipin-vishwakarma-b407313b8"><img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin" alt="LinkedIn" /></a>
</div>

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Crafted with ❤️ by <a href="https://github.com/bipin-vishwakarma"><strong>Bipin Vishwakarma</strong></a>
</div>

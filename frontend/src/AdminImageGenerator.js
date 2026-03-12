import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";
import Layout from "./components/Layout";
import ImageUploadBox from "./components/ImageUploadBox";

const THEMES = {
  universityGreen: {
    label: "University Green",
    surface: "from-emerald-900 via-emerald-800 to-green-600",
    card: "rgba(255,255,255,0.14)",
    text: "#ffffff",
    subtext: "#dcfce7",
    accent: "#facc15",
    accentText: "#14532d",
  },
  formalForest: {
    label: "Formal Forest",
    surface: "from-green-950 via-emerald-900 to-teal-700",
    card: "rgba(236,253,245,0.16)",
    text: "#f0fdf4",
    subtext: "#bbf7d0",
    accent: "#a7f3d0",
    accentText: "#065f46",
  },
  cleanLight: {
    label: "Clean Light",
    surface: "from-slate-100 via-white to-emerald-100",
    card: "rgba(255,255,255,0.85)",
    text: "#14532d",
    subtext: "#166534",
    accent: "#166534",
    accentText: "#ffffff",
  },
};

const FONT_OPTIONS = {
  kanit: { label: "Kanit", family: "'Kanit', sans-serif" },
  prompt: { label: "Prompt", family: "'Prompt', sans-serif" },
  sarabun: { label: "Sarabun", family: "'Sarabun', sans-serif" },
};

const PAPER_SIZES = {
  square:    { label: "Square (1080×1080)",       width: 1080, height: 1080 },
  portrait:  { label: "Portrait (1080×1350)",     width: 1080, height: 1350 },
  landscape: { label: "Landscape (1600×900)",     width: 1600, height: 900  },
  hd:        { label: "HD (1920×1080)",           width: 1920, height: 1080 },
  a4p:       { label: "A4 Portrait (2480×3508)",  width: 2480, height: 3508 },
  a4l:       { label: "A4 Landscape (3508×2480)", width: 3508, height: 2480 },
  custom:    { label: "กำหนดเอง...",              width: null, height: null },
};

const TEMPLATE_LIBRARY = {
  electionResult: {
    label: "ประกาศผลเลือกตั้ง",
    caption: "สรุปผลอย่างเป็นทางการ",
    size: { width: 1600, height: 900 },
    title: "ประกาศผลการเลือกตั้งประธานนิสิต",
    description: "ขอขอบคุณนิสิตทุกคนที่ร่วมลงคะแนนเสียงอย่างโปร่งใสและสร้างสรรค์",
    extra: "ตรวจสอบคะแนนฉบับสมบูรณ์ได้ที่เว็บไซต์ KUVote",
    themeKey: "universityGreen",
  },
  thankYou: {
    label: "ขอบคุณผู้เข้าร่วม",
    caption: "ส่งสารขอบคุณหลังจบกิจกรรม",
    size: { width: 1080, height: 1080 },
    title: "ขอบคุณทุกการมีส่วนร่วม",
    description: "พลังของนิสิตทุกคนคือแรงขับเคลื่อนสำคัญของประชาธิปไตยในมหาวิทยาลัย",
    extra: "แล้วพบกันใหม่ในการเลือกตั้งครั้งถัดไป",
    themeKey: "formalForest",
  },
  event: {
    label: "ประกาศกิจกรรม",
    caption: "แจ้งวันเวลาและสถานที่",
    size: { width: 1080, height: 1350 },
    title: "ประชุมชี้แจงนโยบายผู้สมัคร",
    description: "ขอเชิญนิสิตเข้าร่วมรับฟังแนวทางและวิสัยทัศน์ของผู้สมัครทุกทีม",
    extra: "วันศุกร์ 17:00 น. ณ หอประชุมสุธรรม อารีกุล",
    themeKey: "universityGreen",
  },
  general: {
    label: "ประกาศทั่วไป",
    caption: "ใช้ได้กับเนื้อหาประชาสัมพันธ์ทั่วไป",
    size: { width: 1080, height: 1080 },
    title: "ประกาศจากองค์การนิสิต",
    description: "ติดตามข่าวสารและตารางกิจกรรมล่าสุดผ่านระบบ KUVote และช่องทางทางการ",
    extra: "สอบถามข้อมูลเพิ่มเติมได้ที่ฝ่ายประชาสัมพันธ์",
    themeKey: "cleanLight",
  },
};

const BUILT_IN_LOGOS = [
  { id: "ku", short: "มก.", name: "มหาวิทยาลัยเกษตรศาสตร์", bg: "#166534", text: "#ffffff" },
  { id: "kuvote", short: "KU", name: "KUVote Official", bg: "#14532d", text: "#facc15" },
  { id: "student", short: "อส.", name: "องค์การนิสิต", bg: "#0f766e", text: "#ffffff" },
];

function logoToSvgDataUrl({ short, bg, text }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><circle cx="110" cy="110" r="104" fill="${bg}"/><circle cx="110" cy="110" r="95" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="2"/><text x="110" y="120" font-family="Kanit,sans-serif" font-size="52" font-weight="900" fill="${text}" text-anchor="middle">${short}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminImageGenerator() {
  const previewRef = useRef(null);

  const [templateKey, setTemplateKey] = useState("electionResult");
  const [themeKey, setThemeKey] = useState("universityGreen");
  const [fontKey, setFontKey] = useState("kanit");
  const [title, setTitle] = useState(TEMPLATE_LIBRARY.electionResult.title);
  const [description, setDescription] = useState(TEMPLATE_LIBRARY.electionResult.description);
  const [extra, setExtra] = useState(TEMPLATE_LIBRARY.electionResult.extra);
  const [logoImage, setLogoImage] = useState(() => logoToSvgDataUrl(BUILT_IN_LOGOS[0]));
  const [logoMode, setLogoMode] = useState("preset");
  const [selectedLogoId, setSelectedLogoId] = useState(BUILT_IN_LOGOS[0].id);
  const [fileName, setFileName] = useState("kuvote-admin-image");
  const [exportFormat, setExportFormat] = useState("png");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [sizePreset, setSizePreset] = useState("");
  const [customWidth, setCustomWidth] = useState(1600);
  const [customHeight, setCustomHeight] = useState(900);
  const [fontScale, setFontScale] = useState(1.0);

  const activeTemplate = TEMPLATE_LIBRARY[templateKey];
  const activeTheme = THEMES[themeKey];
  const activeFont = FONT_OPTIONS[fontKey];

  const canvasSize =
    sizePreset === "custom"
      ? { width: Number(customWidth) || 1080, height: Number(customHeight) || 1080 }
      : sizePreset && PAPER_SIZES[sizePreset]
        ? { width: PAPER_SIZES[sizePreset].width, height: PAPER_SIZES[sizePreset].height }
        : activeTemplate.size;

  const previewScale = useMemo(() => {
    const maxSide = Math.max(canvasSize.width, canvasSize.height);
    return 760 / maxSide;
  }, [canvasSize.height, canvasSize.width]);

  const previewStyle = {
    width: `${Math.round(canvasSize.width * previewScale)}px`,
    height: `${Math.round(canvasSize.height * previewScale)}px`,
  };

  const canvasStyle = {
    width: `${canvasSize.width}px`,
    height: `${canvasSize.height}px`,
  };

  const typography = useMemo(() => {
    const base = Math.min(canvasSize.width, canvasSize.height);
    const s = fontScale;
    return {
      university: Math.round(base * 0.032 * s),
      title: Math.round(base * 0.09 * s),
      description: Math.round(base * 0.038 * s),
      extra: Math.round(base * 0.03 * s),
      footer: Math.round(base * 0.026 * s),
    };
  }, [canvasSize.height, canvasSize.width, fontScale]);

  const applyTemplate = (key) => {
    const template = TEMPLATE_LIBRARY[key];
    if (!template) return;
    setTemplateKey(key);
    setThemeKey(template.themeKey);
    setTitle(template.title);
    setDescription(template.description);
    setExtra(template.extra);
    setStatusMessage(`เลือกเทมเพลต: ${template.label}`);
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setLogoImage(dataUrl);
    setLogoMode("upload");
  };

  const renderDataUrl = async (format) => {
    if (!previewRef.current) return null;
    const canvas = await html2canvas(previewRef.current, {
      useCORS: true,
      scale: 2,
      backgroundColor: null,
    });
    const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
    return format === "jpg" ? canvas.toDataURL(mimeType, 0.95) : canvas.toDataURL(mimeType);
  };

  const handleGenerateImage = async () => {
    try {
      setIsGenerating(true);
      setStatusMessage("");
      const dataUrl = await renderDataUrl(exportFormat);
      if (!dataUrl) return;
      setGeneratedAt(new Date().toLocaleString("th-TH"));
      setStatusMessage("สร้างภาพสำเร็จ พร้อมดาวน์โหลด");
    } catch (error) {
      console.error("Generate image failed:", error);
      setStatusMessage("สร้างภาพไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const dataUrl = await renderDataUrl(exportFormat);
      if (!dataUrl) return;

      const link = document.createElement("a");
      link.href = dataUrl;
      const safeName = (fileName || "kuvote-admin-image").replace(/[^a-zA-Z0-9\-_]/g, "");
      link.download = `${safeName || "kuvote-admin-image"}-${templateKey}.${exportFormat}`;
      link.click();
      setStatusMessage("ดาวน์โหลดภาพเรียบร้อย");
    } catch (error) {
      console.error("Download failed:", error);
      setStatusMessage("ดาวน์โหลดไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 text-slate-900">
        <section className="rounded-[1.75rem] border border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-600 p-6 md:p-8 text-white shadow-[0_20px_60px_-30px_rgba(4,120,87,0.8)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-emerald-100">University Admin Tool</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight">Poster Studio</h1>
              <p className="mt-2 max-w-2xl text-emerald-50/90 text-sm md:text-base">
                สร้างภาพประกาศมหาวิทยาลัยแบบเป็นขั้นตอน เข้าใจง่าย และเห็นผลลัพธ์แบบเรียลไทม์
              </p>
              <div className="mt-4 inline-flex rounded-full border border-white/25 bg-white/10 p-1">
                <Link to="/admin-image-generator" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-900">
                  Poster Mode
                </Link>
                <Link to="/admin-candidate-media" className="rounded-full px-3 py-1.5 text-xs font-bold text-white/90 hover:bg-white/10 transition">
                  Candidate Mode
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm">
              <p className="font-bold">โหมดทำงาน: Live Preview</p>
              <p className="text-emerald-100">ทุกการแก้ไขจะแสดงผลในภาพตัวอย่างทันที</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Control Panel</h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">4 Steps</span>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">Step 1: เลือกรูปแบบ (Template)</p>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(TEMPLATE_LIBRARY).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyTemplate(key)}
                    className={`rounded-xl border px-3 py-2 text-left transition ${
                      key === templateKey
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-emerald-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.caption}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">Step 2: แก้ไขข้อความ</p>
              <div className="space-y-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ข้อความหัวเรื่อง"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ข้อความรายละเอียด"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  placeholder="ข้อความเพิ่มเติม"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">Step 3: ปรับรูปแบบ</p>
              <div className="space-y-3">
                <select
                  value={fontKey}
                  onChange={(e) => setFontKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                >
                  {Object.entries(FONT_OPTIONS).map(([key, item]) => (
                    <option key={key} value={key}>{item.label}</option>
                  ))}
                </select>
                <select
                  value={themeKey}
                  onChange={(e) => setThemeKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                >
                  {Object.entries(THEMES).map(([key, item]) => (
                    <option key={key} value={key}>{item.label}</option>
                  ))}
                </select>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex rounded-lg border border-slate-300 p-1">
                    <button
                      type="button"
                      onClick={() => setLogoMode("preset")}
                      className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${logoMode === "preset" ? "bg-emerald-600 text-white" : "text-slate-600"}`}
                    >
                      โลโก้มาตรฐาน
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoMode("upload")}
                      className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${logoMode === "upload" ? "bg-emerald-600 text-white" : "text-slate-600"}`}
                    >
                      อัปโหลดโลโก้
                    </button>
                  </div>

                  {logoMode === "preset" ? (
                    <div className="grid grid-cols-3 gap-2">
                      {BUILT_IN_LOGOS.map((logo) => (
                        <button
                          key={logo.id}
                          type="button"
                          onClick={() => {
                            setSelectedLogoId(logo.id);
                            setLogoImage(logoToSvgDataUrl(logo));
                          }}
                          className={`rounded-lg border p-2 text-center transition ${
                            selectedLogoId === logo.id
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <img src={logoToSvgDataUrl(logo)} alt={logo.name} className="mx-auto h-10 w-10 rounded-full object-contain bg-slate-50 p-1" />
                          <p className="mt-1 text-[10px] font-semibold text-slate-600">{logo.short}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <ImageUploadBox
                      label="เลือกโลโก้มหาวิทยาลัย"
                      preview={logoImage}
                      onChange={handleImageChange}
                    />
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">ขนาดกระดาษ</p>
                  <select
                    value={sizePreset}
                    onChange={(e) => setSizePreset(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="">ตามเทมเพลต ({activeTemplate.size.width}×{activeTemplate.size.height})</option>
                    {Object.entries(PAPER_SIZES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                  {sizePreset === "custom" && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input
                        type="number" min="100" max="7000"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        placeholder="กว้าง (px)"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      />
                      <input
                        type="number" min="100" max="7000"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        placeholder="สูง (px)"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-600">ขนาดตัวอักษร</p>
                    <span className="text-xs font-bold text-emerald-700">{fontScale}x</span>
                  </div>
                  <input
                    type="range" min="0.5" max="2.0" step="0.05"
                    value={fontScale}
                    onChange={(e) => setFontScale(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                    <span>เล็ก (0.5x)</span><span>ปกติ (1x)</span><span>ใหญ่ (2x)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-900">Step 4: สร้างภาพและดาวน์โหลด</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value.replace(/[^a-zA-Z0-9\-_]/g, ""))}
                  placeholder="ชื่อไฟล์"
                  className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-800 transition disabled:opacity-60"
              >
                {isGenerating ? "กำลังสร้างภาพ..." : "สร้างภาพ"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition disabled:opacity-60"
              >
                {isDownloading ? "กำลังดาวน์โหลด..." : `ดาวน์โหลดภาพ ${exportFormat.toUpperCase()}`}
              </button>
              {statusMessage && <p className="text-xs text-emerald-700">{statusMessage}</p>}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm p-4 md:p-6 overflow-auto">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Live Preview</h2>
                <p className="text-sm text-slate-500">ภาพตัวอย่างจะอัปเดตทันทีเมื่อมีการแก้ไขข้อความหรือสไตล์</p>
              </div>
              <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
                <p className="font-semibold">{canvasSize.width} x {canvasSize.height}px</p>
                {generatedAt && <p className="mt-1">ล่าสุด: {generatedAt}</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(45deg,#f8fafc_25%,#f1f5f9_25%,#f1f5f9_50%,#f8fafc_50%,#f8fafc_75%,#f1f5f9_75%,#f1f5f9_100%)] bg-[length:24px_24px] p-4 md:p-6">
              <div className="mx-auto" style={previewStyle}>
                <div className="overflow-hidden rounded-2xl shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] ring-1 ring-white/60">
                  <div
                    ref={previewRef}
                    style={canvasStyle}
                    className={`relative overflow-hidden bg-gradient-to-br ${activeTheme.surface}`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_35%)]" />
                    <div className="absolute inset-0 bg-black/10" />

                    <div className="relative z-10 flex h-full flex-col justify-between p-[6.8%]" style={{ fontFamily: activeFont.family }}>
                      <div className="flex items-start justify-between gap-6">
                        <div className="max-w-[74%]">
                          <p
                            className="font-bold uppercase tracking-[0.35em]"
                            style={{ color: activeTheme.subtext, fontSize: `${typography.university}px` }}
                          >
                            Kasetsart University
                          </p>
                          <h3
                            className="mt-4 font-black leading-[1.04]"
                            style={{ color: activeTheme.text, fontSize: `${typography.title}px` }}
                          >
                            {title}
                          </h3>
                          <p
                            className="mt-4 leading-relaxed"
                            style={{ color: activeTheme.subtext, fontSize: `${typography.description}px` }}
                          >
                            {description}
                          </p>
                        </div>

                        <div className="h-[12vw] w-[12vw] min-h-[90px] min-w-[90px] overflow-hidden rounded-3xl border border-white/35 bg-white/20 p-2">
                          {logoImage ? (
                            <img src={logoImage} alt="university-logo" className="h-full w-full object-contain object-center" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-black text-white">LOGO</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p
                          className="inline-flex max-w-full rounded-full px-5 py-2.5 font-black"
                          style={{
                            backgroundColor: activeTheme.accent,
                            color: activeTheme.accentText,
                            fontSize: `${typography.extra}px`,
                          }}
                        >
                          {extra}
                        </p>

                        <div className="rounded-2xl border border-white/20 px-5 py-4" style={{ backgroundColor: activeTheme.card }}>
                          <p className="font-semibold" style={{ color: activeTheme.text, fontSize: `${typography.footer}px` }}>
                            Official University Communication Tool
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
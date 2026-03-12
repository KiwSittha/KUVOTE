import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";
import Layout from "./components/Layout";

const TEMPLATES = {
  profile: {
    label: "Profile Card",
    caption: "การ์ดแนะนำผู้สมัคร",
    width: 1080,
    height: 1350,
  },
  campaign: {
    label: "Campaign Poster",
    caption: "โปสเตอร์หาเสียง",
    width: 1080,
    height: 1080,
  },
  banner: {
    label: "Announcement Banner",
    caption: "แบนเนอร์ประชาสัมพันธ์",
    width: 1600,
    height: 900,
  },
};

const THEMES = {
  universityGreen: {
    label: "University Green",
    surfaceClass: "from-emerald-900 via-emerald-800 to-green-600",
    titleClass: "text-white",
    subClass: "text-emerald-100",
    chipClass: "bg-yellow-400 text-slate-900",
    panelClass: "bg-emerald-900/55",
  },
  forestNight: {
    label: "Forest Night",
    surfaceClass: "from-slate-900 via-emerald-900 to-teal-700",
    titleClass: "text-white",
    subClass: "text-slate-100",
    chipClass: "bg-cyan-200 text-slate-900",
    panelClass: "bg-slate-900/55",
  },
  cleanLight: {
    label: "Clean Light",
    surfaceClass: "from-slate-100 via-white to-emerald-100",
    titleClass: "text-emerald-900",
    subClass: "text-emerald-700",
    chipClass: "bg-emerald-700 text-white",
    panelClass: "bg-white/75",
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

const AVATAR_FALLBACK =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ecfeff"/>
          <stop offset="100%" stop-color="#d1fae5"/>
        </linearGradient>
      </defs>
      <rect width="720" height="720" fill="url(#bg)"/>
      <circle cx="360" cy="270" r="120" fill="#94a3b8"/>
      <rect x="180" y="430" width="360" height="190" rx="95" fill="#94a3b8"/>
      <text x="360" y="670" text-anchor="middle" font-family="Kanit, sans-serif" font-size="36" fill="#475569">No candidate image</text>
    </svg>
  `);

const DEFAULT_UNI_LOGO =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <circle cx="150" cy="150" r="142" fill="#166534"/>
      <circle cx="150" cy="150" r="126" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="3"/>
      <text x="150" y="168" text-anchor="middle" font-family="Kanit, sans-serif" font-size="86" font-weight="900" fill="#ffffff">KU</text>
    </svg>
  `);

function buildSafeName(candidate) {
  return (candidate?.name || "candidate")
    .replace(/[^a-zA-Z0-9\u0E00-\u0E7F-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getNameTextClass(name = "") {
  const len = String(name).trim().length;
  if (len > 24) return "text-4xl leading-tight";
  if (len > 16) return "text-5xl leading-tight";
  return "text-6xl leading-tight";
}

export default function AdminCandidateMediaGenerator() {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [onlyApproved, setOnlyApproved] = useState(false);

  const [templateKey, setTemplateKey] = useState("profile");
  const [themeKey, setThemeKey] = useState("universityGreen");
  const [fontKey, setFontKey] = useState("kanit");
  const [showWatermark, setShowWatermark] = useState(true);
  const [renderScale, setRenderScale] = useState(2);

  const [candidateName, setCandidateName] = useState("");
  const [candidateNumber, setCandidateNumber] = useState("");
  const [candidateFaculty, setCandidateFaculty] = useState("");
  const [candidateSlogan, setCandidateSlogan] = useState("");

  const [customCandidateImage, setCustomCandidateImage] = useState("");
  const [uniLogoImage, setUniLogoImage] = useState(DEFAULT_UNI_LOGO);

  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastGeneratedAt, setLastGeneratedAt] = useState("");

  const [isCreatingImage, setIsCreatingImage] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [sizePreset, setSizePreset] = useState("");
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [fontScale, setFontScale] = useState(1.0);

  const previewRef = useRef(null);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await fetch(`${API_BASE}/candidates`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      const sorted = [...rows].sort((a, b) => (a.candidateId || 0) - (b.candidateId || 0));
      setCandidates(sorted);
      if (sorted.length > 0) {
        setSelectedId(String(sorted[0]._id || sorted[0].candidateId));
      }
      setStatusMessage(`โหลดข้อมูลผู้สมัคร ${sorted.length} รายการสำเร็จ`);
    } catch (error) {
      console.error("Load candidates failed:", error);
      setCandidates([]);
      setErrorMessage("โหลดข้อมูลผู้สมัครไม่สำเร็จ กรุณาตรวจสอบเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    if (!onlyApproved) return candidates;
    return candidates.filter((c) => c.status === "approved");
  }, [candidates, onlyApproved]);

  const visibleCandidates = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return filteredCandidates;
    return filteredCandidates.filter((c) => {
      const name = String(c.name || "").toLowerCase();
      const faculty = String(c.faculty || "").toLowerCase();
      const number = String(c.candidateId || "").toLowerCase();
      return name.includes(keyword) || faculty.includes(keyword) || number.includes(keyword);
    });
  }, [filteredCandidates, searchKeyword]);

  const selectedCandidate = useMemo(() => {
    return candidates.find((c) => String(c._id || c.candidateId) === String(selectedId)) || null;
  }, [candidates, selectedId]);

  useEffect(() => {
    if (visibleCandidates.length === 0) {
      setSelectedId(null);
      return;
    }
    const found = visibleCandidates.some((c) => String(c._id || c.candidateId) === String(selectedId));
    if (!found) {
      setSelectedId(String(visibleCandidates[0]._id || visibleCandidates[0].candidateId));
    }
  }, [visibleCandidates, selectedId]);

  useEffect(() => {
    if (!selectedCandidate) return;
    setCandidateName(selectedCandidate.name || "");
    setCandidateNumber(String(selectedCandidate.candidateId || ""));
    setCandidateFaculty(selectedCandidate.faculty || "");
    setCandidateSlogan(selectedCandidate.slogan || selectedCandidate.partyName || "");
    setCustomCandidateImage("");
  }, [selectedCandidate]);

  const workingCandidate = useMemo(() => {
    const baseCandidate = selectedCandidate || {};
    return {
      ...baseCandidate,
      name: candidateName || baseCandidate.name || "ชื่อผู้สมัคร",
      candidateId: candidateNumber || baseCandidate.candidateId || "1",
      faculty: candidateFaculty || baseCandidate.faculty || "คณะตัวอย่าง",
      slogan: candidateSlogan || baseCandidate.slogan || baseCandidate.partyName || "วิสัยทัศน์เพื่อพัฒนามหาวิทยาลัย",
      profileImage: customCandidateImage || baseCandidate.profileImage || "",
    };
  }, [
    candidateFaculty,
    candidateName,
    candidateNumber,
    candidateSlogan,
    customCandidateImage,
    selectedCandidate,
  ]);

  const activeTemplate = TEMPLATES[templateKey];
  const activeTheme = THEMES[themeKey];
  const activeFont = FONT_OPTIONS[fontKey];

  const canvasW =
    sizePreset === "custom"
      ? Number(customWidth) || activeTemplate.width
      : sizePreset && PAPER_SIZES[sizePreset]
        ? PAPER_SIZES[sizePreset].width
        : activeTemplate.width;

  const canvasH =
    sizePreset === "custom"
      ? Number(customHeight) || activeTemplate.height
      : sizePreset && PAPER_SIZES[sizePreset]
        ? PAPER_SIZES[sizePreset].height
        : activeTemplate.height;

  const typo = useMemo(() => {
    const base = Math.min(canvasW, canvasH);
    const s = fontScale;
    return {
      xl8: Math.round(base * 0.089 * s),
      xl5: Math.round(base * 0.044 * s),
      xl4: Math.round(base * 0.033 * s),
      xl3: Math.round(base * 0.028 * s),
      xl2: Math.round(base * 0.022 * s),
      xl:  Math.round(base * 0.019 * s),
      lg:  Math.round(base * 0.017 * s),
      sm:  Math.round(base * 0.013 * s),
    };
  }, [canvasW, canvasH, fontScale]);

  const canvasStyle = {
    width: `${canvasW}px`,
    height: `${canvasH}px`,
  };

  const captureCanvas = async (targetRef) => {
    if (!targetRef.current) return null;
    return html2canvas(targetRef.current, {
      useCORS: true,
      scale: renderScale,
      backgroundColor: null,
    });
  };

  const toBlobFromCanvas = (canvas, format = "png") => {
    const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
    if (format === "jpg") {
      const dataUrl = canvas.toDataURL(mimeType, 0.95);
      return fetch(dataUrl).then((r) => r.blob());
    }
    return new Promise((resolve) => canvas.toBlob(resolve, mimeType));
  };

  const buildFileName = (candidate, format = "png") => {
    const safeName = buildSafeName(candidate);
    return `kuvote-candidate-${candidate.candidateId || "x"}-${safeName}-${templateKey}.${format}`;
  };

  const handleCreateImage = async () => {
    if (!previewRef.current) return;
    try {
      setIsCreatingImage(true);
      setStatusMessage("");
      setErrorMessage("");
      const canvas = await captureCanvas(previewRef);
      if (!canvas) return;
      setLastGeneratedAt(new Date().toLocaleString("th-TH"));
      setStatusMessage("สร้างภาพสำเร็จ พร้อมดาวน์โหลด");
    } catch (error) {
      console.error("Create image failed:", error);
      setErrorMessage("สร้างภาพไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsCreatingImage(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!previewRef.current) return;
    try {
      setIsDownloadingPng(true);
      setStatusMessage("");
      setErrorMessage("");
      const canvas = await captureCanvas(previewRef);
      if (!canvas) return;
      const blob = await toBlobFromCanvas(canvas, "png");
      if (!blob) return;
      const fileName = buildFileName(workingCandidate, "png");
      downloadBlob(blob, fileName);
      setStatusMessage(`ดาวน์โหลด PNG สำเร็จ (${fileName})`);
    } catch (error) {
      console.error("Download PNG failed:", error);
      setErrorMessage("ดาวน์โหลด PNG ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsDownloadingPng(false);
    }
  };

  const handlePublishBanner = async () => {
    if (!previewRef.current) return;
    try {
      setIsPublishing(true);
      setStatusMessage("");
      setErrorMessage("");
      const canvas = await captureCanvas(previewRef);
      if (!canvas) return;
      // แปลงเป็น JPEG เพื่อให้ขนาดไฟล์เล็กลง แล้วส่งเป็น base64
      const imageUrl = canvas.toDataURL("image/jpeg", 0.85);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/home-banner`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageUrl, label: templateKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "เผยแพร่ไม่สำเร็จ");
      setStatusMessage("เผยแพร่แบนเนอร์หน้าหลักสำเร็จ!");
    } catch (error) {
      console.error("Publish banner failed:", error);
      setErrorMessage("เผยแพร่ไม่สำเร็จ: " + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleResetSettings = () => {
    setTemplateKey("profile");
    setThemeKey("universityGreen");
    setFontKey("kanit");
    setShowWatermark(true);
    setRenderScale(2);
    setOnlyApproved(true);
    setSearchKeyword("");
    setCustomCandidateImage("");
    setUniLogoImage(DEFAULT_UNI_LOGO);
    setSizePreset("");
    setFontScale(1.0);
    setStatusMessage("รีเซ็ตการตั้งค่าเรียบร้อย");
    setErrorMessage("");
  };

  const handleUploadCandidateImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setCustomCandidateImage(dataUrl);
  };

  const handleUploadUniLogo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setUniLogoImage(dataUrl);
  };

  const renderTemplateCanvas = (candidate, refNode) => (
    <div
      ref={refNode}
      style={{
        ...canvasStyle,
        fontFamily: activeFont.family,
      }}
      className={`relative overflow-hidden bg-gradient-to-br ${activeTheme.surfaceClass}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_35%)]" />

      {showWatermark && (
        <div className="absolute left-8 top-8 z-20 inline-flex items-center gap-3 rounded-full border border-white/35 bg-white/15 px-4 py-2 backdrop-blur-sm">
          <img src={uniLogoImage} alt="University logo" className="h-10 w-10 rounded-full object-cover border border-white/30" />
          <span className="text-white/95 font-bold tracking-wide" style={{ fontSize: `${typo.lg}px` }}>Kasetsart University</span>
        </div>
      )}

      {templateKey === "profile" ? (
        <div className="relative z-10 h-full flex flex-col p-10 pt-28">
          <div className="rounded-2xl border-8 border-white/90 bg-slate-100 overflow-hidden h-[70%] flex items-center justify-center p-4">
            {candidate.profileImage ? (
              <img
                src={candidate.profileImage}
                alt={candidate.name || "candidate"}
                className="max-h-full max-w-full w-auto h-auto object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = AVATAR_FALLBACK;
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold" style={{ fontSize: `${typo.xl2}px` }}>ไม่มีรูปผู้สมัคร</div>
            )}
          </div>

          <div className={`mt-auto rounded-xl p-6 text-center ${activeTheme.panelClass}`}>
            <p className={`font-black ${activeTheme.titleClass}`} style={{ fontSize: `${typo.xl5}px` }}>{candidate.name || "ไม่ระบุชื่อ"}</p>
            <p className={`mt-2 ${activeTheme.subClass}`} style={{ fontSize: `${typo.xl2}px` }}>คณะ {candidate.faculty || "ไม่ระบุ"}</p>
            {candidate.slogan && <p className="mt-3 font-semibold text-white/95" style={{ fontSize: `${typo.xl}px` }}>"{candidate.slogan}"</p>}
          </div>

          <div className="absolute right-10 top-24 h-24 w-24 rounded-full bg-orange-500 text-white font-black flex items-center justify-center shadow-2xl" style={{ fontSize: `${typo.xl5}px` }}>
            {candidate.candidateId || "?"}
          </div>
        </div>
      ) : templateKey === "campaign" ? (
        <div className="relative z-10 h-full p-12">
          <div className="absolute right-[8%] top-[10%] h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute right-[14%] bottom-[14%] h-56 w-56 rounded-full bg-emerald-200/10 blur-3xl" />

          <div className="relative h-full rounded-[2.2rem] border border-white/35 bg-black/20 p-10 backdrop-blur-sm">
            <div className="h-full grid grid-cols-[0.95fr_1.05fr] gap-8">
              <div className="rounded-[1.5rem] bg-slate-100 overflow-hidden flex items-center justify-center p-4">
                {candidate.profileImage ? (
                  <img
                    src={candidate.profileImage}
                    alt={candidate.name || "candidate"}
                    className="max-h-full max-w-full w-auto h-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = AVATAR_FALLBACK;
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold" style={{ fontSize: `${typo.xl2}px` }}>ไม่มีรูปผู้สมัคร</div>
                )}
              </div>

              <div className="flex flex-col text-white">
                <div>
                  <p className={`inline-flex rounded-full px-4 py-1 font-black ${activeTheme.chipClass}`} style={{ fontSize: `${typo.sm}px` }}>Campaign Poster</p>
                  <p className={`mt-6 font-black ${activeTheme.titleClass}`} style={{ fontSize: `${typo.xl5}px` }}>{candidate.name || "ไม่ระบุชื่อ"}</p>
                  <p className={`mt-4 ${activeTheme.subClass}`} style={{ fontSize: `${typo.xl2}px` }}>คณะ {candidate.faculty || "ไม่ระบุ"}</p>
                </div>

                <div className="mt-6 rounded-2xl border border-white/25 bg-white/10 px-5 py-4">
                  <p className="font-bold text-white/85" style={{ fontSize: `${typo.lg}px` }}>คำขวัญหาเสียง</p>
                  <p className="mt-2 font-semibold leading-relaxed text-white" style={{ fontSize: `${typo.xl2}px`, maxHeight: "8.5rem", overflow: "hidden" }}>
                    {candidate.slogan ? `"${candidate.slogan}"` : "พร้อมพัฒนามหาวิทยาลัยไปด้วยกัน"}
                  </p>
                </div>

                <div className="mt-auto flex items-end justify-end pt-6">
                  <div className={`rounded-2xl px-5 py-3 ${activeTheme.chipClass}`}>
                    <p className="uppercase tracking-[0.25em] opacity-80" style={{ fontSize: `${typo.sm}px` }}>Candidate No.</p>
                    <p className="mt-1 font-black" style={{ fontSize: `${typo.xl4}px` }}>#{candidate.candidateId || "?"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 h-full flex items-center p-14 gap-10 pt-24">
          <div className="h-[600px] w-[600px] rounded-[2.5rem] border-8 border-white/90 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-4">
            {candidate.profileImage ? (
              <img
                src={candidate.profileImage}
                alt={candidate.name || "candidate"}
                className="max-h-full max-w-full w-auto h-auto object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = AVATAR_FALLBACK;
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold" style={{ fontSize: `${typo.xl2}px` }}>ไม่มีรูปผู้สมัคร</div>
            )}
          </div>

          <div className="text-white">
            <p className={`tracking-[0.35em] uppercase ${activeTheme.subClass}`} style={{ fontSize: `${typo.xl2}px` }}>Announcement Banner</p>
            <p className={`mt-5 font-black leading-tight ${activeTheme.titleClass}`} style={{ fontSize: `${typo.xl8}px` }}>{candidate.name || "ไม่ระบุชื่อ"}</p>
            <p className={`mt-4 ${activeTheme.subClass}`} style={{ fontSize: `${typo.xl4}px` }}>คณะ {candidate.faculty || "ไม่ระบุ"}</p>
            {candidate.slogan && <p className="mt-5 font-semibold text-white/95" style={{ fontSize: `${typo.xl3}px` }}>{candidate.slogan}</p>}
            <p className={`mt-10 inline-flex rounded-full px-8 py-3 font-black ${activeTheme.chipClass}`} style={{ fontSize: `${typo.xl3}px` }}>ผู้สมัครหมายเลข {candidate.candidateId || "-"}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 text-slate-900">
        <section className="rounded-[1.75rem] border border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-600 p-6 md:p-8 text-white shadow-[0_20px_60px_-30px_rgba(4,120,87,0.8)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-100/90">University Admin Dashboard</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight">Candidate Media Studio</h1>
              <p className="mt-2 max-w-3xl text-emerald-50/90 text-sm md:text-base">เครื่องมือสร้างสื่อประชาสัมพันธ์ผู้สมัครแบบมืออาชีพ ใช้งานง่ายสำหรับเจ้าหน้าที่มหาวิทยาลัย</p>
              <div className="mt-4 inline-flex rounded-full border border-white/25 bg-white/10 p-1 backdrop-blur-sm">
                <Link to="/admin-image-generator" className="rounded-full px-3 py-1.5 text-xs font-bold text-white/90 hover:bg-white/15 transition">Poster Mode</Link>
                <Link to="/admin-candidate-media" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-900">Candidate Mode</Link>
              </div>
            </div>
            <div className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-xs font-semibold text-emerald-50">
              <p>Live Preview: อัปเดตทันทีเมื่อแก้ข้อมูล</p>
              <p>ล่าสุด: {lastGeneratedAt || "ยังไม่ได้สร้างภาพ"}</p>
            </div>
          </div>

        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Control Panel</h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">5 Sections</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 shadow-inner">
              <p className="text-sm font-bold text-slate-900">Template</p>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(TEMPLATES).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTemplateKey(key)}
                    className={`rounded-xl border px-3 py-2 text-left transition ${
                      key === templateKey ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-800">{value.label}</p>
                    <p className="text-xs text-slate-500">{value.caption}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 shadow-inner">
              <p className="text-sm font-bold text-slate-900">Candidate Information</p>
              <p className="text-xs text-slate-500">ถ้าไม่พบผู้สมัครจากฐานข้อมูล สามารถกรอกข้อมูลเองแล้วกด "สร้างภาพ" ได้ทันที</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="ค้นหาชื่อ/คณะ/เบอร์"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <button type="button" onClick={() => setSearchKeyword("")} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600">ล้าง</button>
              </div>

              <select
                value={selectedId || ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                {visibleCandidates.length === 0 && <option value="">ไม่พบข้อมูลผู้สมัคร</option>}
                {visibleCandidates.map((c) => (
                  <option key={String(c._id || c.candidateId)} value={String(c._id || c.candidateId)}>
                    เบอร์ {c.candidateId || "-"} - {c.name || "ไม่ระบุชื่อ"}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-1 gap-2">
                <input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="ชื่อผู้สมัคร" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                <input value={candidateNumber} onChange={(e) => setCandidateNumber(e.target.value)} placeholder="หมายเลขผู้สมัคร" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                <input value={candidateFaculty} onChange={(e) => setCandidateFaculty(e.target.value)} placeholder="คณะ / สาขา" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                <input value={candidateSlogan} onChange={(e) => setCandidateSlogan(e.target.value)} placeholder="คำขวัญหาเสียง" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 shadow-inner">
              <p className="text-sm font-bold text-slate-900">Design Settings</p>
              <select value={fontKey} onChange={(e) => setFontKey(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500">
                {Object.entries(FONT_OPTIONS).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
              <select value={themeKey} onChange={(e) => setThemeKey(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500">
                {Object.entries(THEMES).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
              <select value={renderScale} onChange={(e) => setRenderScale(Number(e.target.value))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500">
                <option value={1}>ขนาด Export 1x</option>
                <option value={2}>ขนาด Export 2x (แนะนำ)</option>
                <option value={3}>ขนาด Export 3x (คมชัดสูง)</option>
              </select>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={showWatermark} onChange={(e) => setShowWatermark(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                เปิด Watermark
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={onlyApproved} onChange={(e) => setOnlyApproved(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                แสดงเฉพาะ Approved
              </label>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">ขนาดกระดาษ</p>
                <select
                  value={sizePreset}
                  onChange={(e) => setSizePreset(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="">ตามเทมเพลต ({activeTemplate.width}×{activeTemplate.height})</option>
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
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    />
                    <input
                      type="number" min="100" max="7000"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      placeholder="สูง (px)"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
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

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 shadow-inner">
              <p className="text-sm font-bold text-slate-900">Media Assets</p>
              <p className="text-xs text-slate-500">รูปผู้สมัครจะถูกล็อกสัดส่วนอัตโนมัติ (ไม่ยืดภาพ)</p>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold text-slate-600 mb-2">อัปโหลดรูปผู้สมัคร</p>
                <input type="file" accept="image/*" onChange={handleUploadCandidateImage} className="w-full text-xs" />
                {customCandidateImage && <img src={customCandidateImage} alt="Candidate upload preview" className="mt-2 h-20 w-20 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1" />}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold text-slate-600 mb-2">อัปโหลดโลโก้มหาวิทยาลัย</p>
                <input type="file" accept="image/*" onChange={handleUploadUniLogo} className="w-full text-xs" />
                {uniLogoImage && <img src={uniLogoImage} alt="University logo preview" className="mt-2 h-20 w-20 rounded-full object-contain bg-slate-50 border border-slate-200 p-1" />}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
              <p className="text-sm font-bold text-emerald-900">Actions</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCreateImage}
                  disabled={!workingCandidate || isCreatingImage}
                  className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-800 transition disabled:opacity-60"
                >
                  {isCreatingImage ? "กำลังสร้างภาพ..." : "สร้างภาพ"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={!workingCandidate || isDownloadingPng}
                  className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition disabled:opacity-60"
                >
                  {isDownloadingPng ? "กำลังดาวน์โหลด..." : "ดาวน์โหลด PNG"}
                </button>
                <button
                  type="button"
                  onClick={handlePublishBanner}
                  disabled={!workingCandidate || isPublishing}
                  className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition disabled:opacity-60 col-span-2"
                >
                  {isPublishing ? "กำลังเผยแพร่..." : "📢 เผยแพร่เป็นแบนเนอร์หน้าหลัก"}
                </button>
                <button
                  type="button"
                  onClick={fetchCandidates}
                  disabled={isLoading}
                  className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition disabled:opacity-60"
                >
                  {isLoading ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
                </button>
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition"
                >
                  รีเซ็ตการตั้งค่า
                </button>
              </div>

              {(statusMessage || errorMessage) && (
                <div className="space-y-2 pt-1">
                  {statusMessage && <p className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-700">{statusMessage}</p>}
                  {errorMessage && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{errorMessage}</p>}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm p-4 md:p-6 overflow-hidden">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Live Preview</h2>
                <p className="text-sm text-slate-500">แสดงผลแบบเรียลไทม์เมื่อมีการแก้ข้อมูล</p>
              </div>
              <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
                {canvasW} x {canvasH}px
              </div>
            </div>

            {workingCandidate ? (
              <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(45deg,#f8fafc_25%,#f1f5f9_25%,#f1f5f9_50%,#f8fafc_50%,#f8fafc_75%,#f1f5f9_75%,#f1f5f9_100%)] bg-[length:24px_24px] p-4 md:p-6">
                <div className="rounded-2xl border border-slate-200/80 bg-white/55 p-3">
                  <div className="max-h-[780px] overflow-auto rounded-xl bg-white/40">
                    <div className="w-fit min-w-full p-3">
                      <div className="mx-auto overflow-hidden rounded-2xl ring-1 ring-white/70 shadow-[0_30px_90px_-35px_rgba(6,95,70,0.55)]" style={canvasStyle}>
                        {renderTemplateCanvas(workingCandidate, previewRef)}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">เลื่อนดูภาพได้ทั้งแนวนอนและแนวตั้งเพื่อดูงานเต็มขนาด</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">กรุณาเลือกผู้สมัครเพื่อแสดงพรีวิว</div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}

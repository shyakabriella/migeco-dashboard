const fileTypeConfig: Record<string, { bg: string; color: string; label: string }> = {
  pdf: { bg: "#3d1515", color: "#e05252", label: "PDF" },
  dwg: { bg: "#0f2040", color: "#4f8ef7", label: "DWG" },
  xlsx: { bg: "#0d2d1a", color: "#3dba6f", label: "XLS" },
  jpg: { bg: "#2d1a3d", color: "#b06ee8", label: "IMG" },
  default: { bg: "#1e2330", color: "#8b9bb4", label: "FILE" },
};

export default function FileIcon({ ext }: { ext: string }) {
  const cfg = fileTypeConfig[ext.toLowerCase()] ?? fileTypeConfig.default;
  return (
    <div
      className="w-8 h-8 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0"
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
    >
      {cfg.label}
    </div>
  );
}

export function getExt(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "file";
}

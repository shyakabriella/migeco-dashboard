import { useMemo, useRef, useState } from "react";
import type { DragEvent, ElementType, ReactNode } from "react";
import {
  Archive,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  Layers,
  MapPinned,
  UploadCloud,
  X,
} from "lucide-react";
import AdminSidebar from "../../admin/AdminSidebar";

type DestinationType = "general" | "project" | "study_area" | "laboratory";

type UploadFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "ready" | "needs_review";
};

type DestinationOption = {
  id: DestinationType;
  title: string;
  description: string;
  icon: ElementType;
};

const destinationOptions: DestinationOption[] = [
  {
    id: "general",
    title: "General Repository",
    description: "Upload without linking to a project.",
    icon: Archive,
  },
  {
    id: "project",
    title: "Existing Project",
    description: "Attach document to a registered project.",
    icon: FolderOpen,
  },
  {
    id: "study_area",
    title: "Study Area",
    description: "Attach to maps, locations, or field areas.",
    icon: MapPinned,
  },
  {
    id: "laboratory",
    title: "Samples & Laboratory",
    description: "Attach to samples, tests, or lab results.",
    icon: ClipboardList,
  },
];

const projects = [
  "Rwanda Tin Exploration",
  "Nyungwe Slope Stability",
  "Kigali Urban Geotech",
  "Lake Kivu Mineral Mapping",
];

const studyAreas = [
  "Northern Mapping Block",
  "Kigali Field Zone A",
  "Western Drill Corridor",
  "Southern Geotechnical Area",
];

const laboratoryItems = [
  "LAB-2026-001 - Soil classification",
  "LAB-2026-014 - Rock strength test",
  "SMP-ALPHA-009 - Core sample",
  "SMP-KGL-031 - Aggregate sample",
];

const categories = [
  "Geological Report",
  "Geotechnical Report",
  "Survey Map",
  "Laboratory Result",
  "Field Note",
  "Contract",
  "Photo Evidence",
];

const documentTypes = [
  "Report",
  "Map",
  "Drawing",
  "Spreadsheet",
  "Image",
  "Certificate",
  "Other",
];

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getDestinationList(type: DestinationType): string[] {
  if (type === "project") {
    return projects;
  }

  if (type === "study_area") {
    return studyAreas;
  }

  if (type === "laboratory") {
    return laboratoryItems;
  }

  return ["Main document repository"];
}

export default function UploadDocumentPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [destinationType, setDestinationType] =
    useState<DestinationType>("general");
  const [selectedDestination, setSelectedDestination] = useState<string>(
    "Main document repository"
  );
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("Geological Report");
  const [documentType, setDocumentType] = useState<string>("Report");
  const [securityLevel, setSecurityLevel] = useState<string>("internal");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [ownerDepartment, setOwnerDepartment] = useState<string>("Geology");
  const [accessScope, setAccessScope] = useState<string>("department");

  const destinationList = useMemo(
    () => getDestinationList(destinationType),
    [destinationType]
  );

  function handleDestinationChange(type: DestinationType): void {
    const nextList = getDestinationList(type);
    setDestinationType(type);
    setSelectedDestination(nextList[0]);
  }

  function handleFileSelection(fileList: FileList | null): void {
    if (!fileList) {
      return;
    }

    const selectedFiles: UploadFile[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type || "Unknown",
      status: file.size > 25 * 1024 * 1024 ? "needs_review" : "ready",
    }));

    setFiles((current) => {
      const existingIds = new Set(current.map((file) => file.id));
      const uniqueFiles = selectedFiles.filter(
        (file) => !existingIds.has(file.id)
      );

      return [...current, ...uniqueFiles];
    });
  }

  function removeFile(fileId: string): void {
    setFiles((current) => current.filter((file) => file.id !== fileId));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    handleFileSelection(event.dataTransfer.files);
  }

  function handleSubmit(): void {
    const payload = {
      title: documentTitle,
      category,
      document_type: documentType,
      security_level: securityLevel,
      destination_type: destinationType,
      destination_name: selectedDestination,
      description,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      owner_department: ownerDepartment,
      access_scope: accessScope,
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    };

    console.log("Upload document payload", payload);
  }

  const readyFiles = files.filter((file) => file.status === "ready").length;
  const reviewFiles = files.filter(
    (file) => file.status === "needs_review"
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Document intake
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">
                Upload Document
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Upload a document and specify exactly where it belongs before it
                enters the document workflow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={files.length === 0}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Submit Upload
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 border-b border-slate-200 bg-white px-6 py-4 md:grid-cols-3">
          <SummaryCard
            title="Files selected"
            value={files.length.toString()}
            detail={`${readyFiles} ready for upload`}
          />
          <SummaryCard
            title="Need review"
            value={reviewFiles.toString()}
            detail="Large or unusual files"
          />
          <SummaryCard
            title="Destination"
            value={
              destinationOptions.find((item) => item.id === destinationType)
                ?.title || "General Repository"
            }
            detail={selectedDestination}
          />
        </section>

        <div className="grid flex-1 gap-6 overflow-auto p-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    Specify Document Destination
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    This controls where the document appears after upload.
                  </p>
                </div>
                <Layers className="h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {destinationOptions.map((option) => {
                  const Icon = option.icon;
                  const active = destinationType === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleDestinationChange(option.id)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                        active
                          ? "border-blue-200 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span
                          className={`block text-sm font-bold ${
                            active ? "text-blue-800" : "text-slate-900"
                          }`}
                        >
                          {option.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Destination target">
                  <select
                    value={selectedDestination}
                    onChange={(event) =>
                      setSelectedDestination(event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {destinationList.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Owner department">
                  <select
                    value={ownerDepartment}
                    onChange={(event) => setOwnerDepartment(event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Geology</option>
                    <option>Geotechnical</option>
                    <option>Laboratory</option>
                    <option>Engineering</option>
                    <option>Administration</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-6 py-8 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-base font-bold text-slate-950">
                  Drop files here or browse
                </h2>
                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Accepted examples: PDF, DOCX, XLSX, DWG, JPG, PNG, ZIP, and
                  field data files.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => handleFileSelection(event.target.files)}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Browse Files
                </button>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                <div className="grid grid-cols-[1fr_120px_130px_40px] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <span>File name</span>
                  <span>Size</span>
                  <span>Status</span>
                  <span />
                </div>

                {files.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No files selected yet.
                  </div>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="grid grid-cols-[1fr_120px_130px_40px] items-center border-t border-slate-100 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="truncate text-sm font-medium text-slate-800">
                          {file.name}
                        </span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {formatFileSize(file.size)}
                      </span>
                      <span
                        className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${
                          file.status === "ready"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {file.status === "ready" ? "Ready" : "Review"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">
                Document Details
              </h2>

              <div className="mt-5 space-y-4">
                <Field label="Document title">
                  <input
                    value={documentTitle}
                    onChange={(event) => setDocumentTitle(event.target.value)}
                    placeholder="Enter document title"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>

                <Field label="Category">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Document type">
                  <select
                    value={documentType}
                    onChange={(event) => setDocumentType(event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {documentTypes.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Security level">
                  <select
                    value={securityLevel}
                    onChange={(event) => setSecurityLevel(event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="public">Public</option>
                    <option value="internal">Internal</option>
                    <option value="confidential">Confidential</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </Field>

                <Field label="Access scope">
                  <select
                    value={accessScope}
                    onChange={(event) => setAccessScope(event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="owner">Uploader only</option>
                    <option value="department">Department</option>
                    <option value="project_team">Project team</option>
                    <option value="management">Management</option>
                  </select>
                </Field>

                <Field label="Tags">
                  <input
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="survey, map, lab"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Add a short note about this document"
                    rows={4}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-700" />
                <div>
                  <h3 className="text-sm font-bold text-blue-950">
                    Upload workflow
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    After upload, the backend can keep the document in
                    quarantine first, then scan it, extract plaintext, and make
                    it visible in the selected destination after approval.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 truncate text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
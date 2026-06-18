import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  Bell,
  Bookmark,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Database,
  Eye,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  History,
  Loader2,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../AdminSidebar";
import {
  getDocuments,
  searchAiAnalysis,
  searchPlaintext,
} from "../../../services/dmsApi";
import type { DmsDocument } from "../../../services/dmsApi";

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

type SearchSource = "documents" | "plaintext" | "ai";

type SearchResult = {
  id: string;
  documentId?: number | string;
  title: string;
  subtitle: string;
  description: string;
  source: SearchSource;
  status?: string | null;
  securityLevel?: string | null;
  updatedAt?: string | null;
  tags: string[];
  document?: Partial<DmsDocument> | null;
};

type PlaintextSearchItem = {
  id?: number | string;
  document_id?: number | string;
  document?: Partial<DmsDocument> | null;
  title?: string | null;
  text?: string | null;
  content?: string | null;
  extracted_text?: string | null;
  snippet?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

type AiSearchItem = {
  id?: number | string;
  document_id?: number | string;
  document?: Partial<DmsDocument> | null;
  summary?: string | null;
  suggested_document_type?: string | null;
  suggested_tags?: string[] | string | null;
  sensitivity_level?: string | null;
  confidence_score?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

const RECENT_QUERY_KEY = "dms_recent_search_queries";
const SAVED_QUERY_KEY = "dms_saved_search_queries";

const searchTabs = [
  {
    label: "Smart Search",
    path: "/search",
    icon: Sparkles,
  },
  {
    label: "Advanced Filters",
    path: "/Advancedfilter",
    icon: SlidersHorizontal,
  },
  // {
  //   label: "Saved Searches",
  //   path: "/SavedSearch",
  //   icon: Bookmark,
  // },
];

const sourceOptions: Array<{
  label: string;
  value: "" | SearchSource;
}> = [
  { label: "All sources", value: "" },
  { label: "Document metadata", value: "documents" },
  { label: "Extracted text", value: "plaintext" },
  { label: "AI analysis", value: "ai" },
];

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Uploaded", value: "uploaded" },
  { label: "Quarantined", value: "quarantined" },
  { label: "Rejected", value: "rejected" },
  { label: "Archived", value: "archived" },
];

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function toLower(value?: string | null): string {
  return value ? String(value).toLowerCase() : "";
}

function getReadableStatus(status?: string | null): string {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

function formatRelativeTime(date?: string | null): string {
  if (!date) return "Unknown time";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Unknown time";

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) return `${diffDays}d ago`;

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getTagsFromValue(tags?: string[] | string | null): string[] {
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string");
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function getDocumentTitle(document?: Partial<DmsDocument> | null): string {
  if (!document) return "Untitled document";

  return (
    document.original_file_name ||
    document.title ||
    document.document_code ||
    `Document #${document.id || "Unknown"}`
  );
}

function getDocumentSubtitle(document?: Partial<DmsDocument> | null): string {
  if (!document) return "No document metadata";

  const projectName = document.project?.name || "No project";
  const categoryName = document.category?.name || "No category";
  const code = document.document_code || "No code";

  return `${code} • ${projectName} • ${categoryName}`;
}

function getDocumentDescription(document?: Partial<DmsDocument> | null): string {
  if (!document) return "No description available.";

  return (
    document.description ||
    document.scan_message ||
    document.sandbox_message ||
    "Document metadata matched your search."
  );
}

function getSourceLabel(source: SearchSource): string {
  if (source === "documents") return "Metadata";
  if (source === "plaintext") return "Extracted Text";
  return "AI Analysis";
}

function getSourceIcon(source: SearchSource): ReactNode {
  if (source === "plaintext") return <Database size={17} />;
  if (source === "ai") return <BrainCircuit size={17} />;
  return <FileText size={17} />;
}

function getSourceClass(source: SearchSource): string {
  if (source === "plaintext") {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  if (source === "ai") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

function getStatusClass(status?: string | null): string {
  switch (toLower(status)) {
    case "active":
    case "clean":
    case "safe":
    case "extracted":
    case "encrypted":
    case "analyzed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "uploaded":
    case "pending":
    case "pending_scan":
    case "scanning":
    case "not_tested":
    case "not_extracted":
    case "not_encrypted":
    case "not_analyzed":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "quarantined":
    case "suspicious":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "infected":
    case "rejected":
    case "failed":
    case "unsafe":
    case "blocked":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function getFileIcon(document?: Partial<DmsDocument> | null): ReactNode {
  const extension = document?.extension?.toLowerCase();

  if (["jpg", "jpeg", "png", "webp", "tif", "tiff"].includes(extension || "")) {
    return <FileImage size={20} className="text-emerald-600" />;
  }

  if (["xls", "xlsx", "csv"].includes(extension || "")) {
    return <FileSpreadsheet size={20} className="text-green-600" />;
  }

  if (["dwg", "dxf", "zip", "rar"].includes(extension || "")) {
    return <FileArchive size={20} className="text-orange-600" />;
  }

  if (extension === "pdf") {
    return <FileText size={20} className="text-red-600" />;
  }

  return <FileText size={20} className="text-blue-600" />;
}

function getStoredQueries(key: string): string[] {
  try {
    const rawValue = localStorage.getItem(key);

    if (!rawValue) return [];

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) return [];

    return parsedValue
      .filter((item): item is string => typeof item === "string")
      .slice(0, 8);
  } catch {
    return [];
  }
}

function setStoredQueries(key: string, queries: string[]): void {
  localStorage.setItem(key, JSON.stringify(queries.slice(0, 8)));
}

function saveRecentQuery(query: string): string[] {
  const cleanQuery = query.trim();

  if (!cleanQuery) return getStoredQueries(RECENT_QUERY_KEY);

  const currentQueries = getStoredQueries(RECENT_QUERY_KEY);
  const nextQueries = [
    cleanQuery,
    ...currentQueries.filter(
      (item) => item.toLowerCase() !== cleanQuery.toLowerCase()
    ),
  ].slice(0, 5);

  setStoredQueries(RECENT_QUERY_KEY, nextQueries);

  return nextQueries;
}

function saveSavedQuery(query: string): string[] {
  const cleanQuery = query.trim();

  if (!cleanQuery) return getStoredQueries(SAVED_QUERY_KEY);

  const currentQueries = getStoredQueries(SAVED_QUERY_KEY);
  const nextQueries = [
    cleanQuery,
    ...currentQueries.filter(
      (item) => item.toLowerCase() !== cleanQuery.toLowerCase()
    ),
  ].slice(0, 8);

  setStoredQueries(SAVED_QUERY_KEY, nextQueries);

  return nextQueries;
}

function makeSnippet(
  value?: string | null,
  fallback = "No content preview available."
): string {
  if (!value) return fallback;

  const cleanValue = value.replace(/\s+/g, " ").trim();

  if (!cleanValue) return fallback;

  return cleanValue.length > 220 ? `${cleanValue.slice(0, 220)}...` : cleanValue;
}

function getPlaintextText(item: PlaintextSearchItem): string {
  return String(
    item.snippet ||
      item.extracted_text ||
      item.content ||
      item.text ||
      item.document?.description ||
      ""
  );
}

function getAiSummaryText(item: AiSearchItem): string {
  return String(
    item.summary ||
      item.document?.description ||
      item.suggested_document_type ||
      "AI analysis matched your search."
  );
}

function buildDocumentResults(documents: DmsDocument[]): SearchResult[] {
  return documents.map((document) => ({
    id: `document-${document.id}`,
    documentId: document.id,
    title: getDocumentTitle(document),
    subtitle: getDocumentSubtitle(document),
    description: getDocumentDescription(document),
    source: "documents",
    status: document.status,
    securityLevel: document.security_level,
    updatedAt: document.updated_at || document.created_at,
    tags: getTagsFromValue(document.tags),
    document,
  }));
}

function buildPlaintextResults(items: unknown[]): SearchResult[] {
  return items.map((unknownItem, index) => {
    const item = unknownItem as PlaintextSearchItem;
    const document = item.document || null;
    const documentId = item.document_id || document?.id || item.id || index;

    return {
      id: `plaintext-${documentId}-${index}`,
      documentId,
      title:
        getDocumentTitle(document) ||
        item.title ||
        `Text result #${index + 1}`,
      subtitle: getDocumentSubtitle(document),
      description: makeSnippet(
        getPlaintextText(item),
        "Extracted text matched your search."
      ),
      source: "plaintext",
      status: document?.status || "extracted",
      securityLevel: document?.security_level,
      updatedAt:
        item.updated_at ||
        item.created_at ||
        document?.updated_at ||
        document?.created_at,
      tags: getTagsFromValue(document?.tags),
      document,
    };
  });
}

function buildAiResults(response: unknown): SearchResult[] {
  const rawResults =
    response &&
    typeof response === "object" &&
    "results" in response &&
    Array.isArray((response as { results?: unknown[] }).results)
      ? ((response as { results: unknown[] }).results as unknown[])
      : Array.isArray(response)
      ? response
      : [];

  return rawResults.map((unknownItem, index) => {
    const item = unknownItem as AiSearchItem;
    const document = item.document || null;
    const documentId = item.document_id || document?.id || item.id || index;

    return {
      id: `ai-${documentId}-${index}`,
      documentId,
      title: getDocumentTitle(document) || `AI result #${index + 1}`,
      subtitle: item.suggested_document_type
        ? `Suggested type: ${getReadableStatus(item.suggested_document_type)}`
        : getDocumentSubtitle(document),
      description: makeSnippet(getAiSummaryText(item)),
      source: "ai",
      status: document?.status || "analyzed",
      securityLevel: String(
        item.sensitivity_level || document?.security_level || ""
      ),
      updatedAt:
        item.updated_at ||
        item.created_at ||
        document?.updated_at ||
        document?.created_at,
      tags: getTagsFromValue(item.suggested_tags),
      document,
    };
  });
}

function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();

  return results.filter((result) => {
    const key = `${result.source}-${result.documentId || result.id}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function sortResults(results: SearchResult[]): SearchResult[] {
  return [...results].sort((first, second) => {
    const firstTime = new Date(first.updatedAt || 0).getTime();
    const secondTime = new Date(second.updatedAt || 0).getTime();

    return secondTime - firstTime;
  });
}

function filterByStatus(results: SearchResult[], status: string): SearchResult[] {
  if (!status) return results;

  return results.filter(
    (result) => toLower(result.status) === toLower(status)
  );
}

function filterBySource(results: SearchResult[], source: string): SearchResult[] {
  if (!source) return results;

  return results.filter((result) => result.source === source);
}

function getQueryFromUrl(search: string): string {
  const params = new URLSearchParams(search);

  return params.get("q") || "";
}

function getDocumentTypeLabel(document?: Partial<DmsDocument> | null): string {
  const extension = document?.extension?.toLowerCase();

  if (extension) return extension.toUpperCase();

  if (document?.document_type) {
    return getReadableStatus(document.document_type);
  }

  return "FILE";
}

function getStoredUserName(): string {
  try {
    const rawUser =
      localStorage.getItem("user") || localStorage.getItem("auth_user");

    if (!rawUser) return "DMS User";

    const user = JSON.parse(rawUser) as { name?: string };

    return user.name || "DMS User";
  } catch {
    return "DMS User";
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "DU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function Smartsearch() {
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>(() =>
    getQueryFromUrl(location.search)
  );
  const [submittedQuery, setSubmittedQuery] = useState<string>(() =>
    getQueryFromUrl(location.search)
  );
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recommendedDocuments, setRecommendedDocuments] = useState<
    DmsDocument[]
  >([]);
  const [recentQueries, setRecentQueries] = useState<string[]>(() =>
    getStoredQueries(RECENT_QUERY_KEY)
  );
  const [savedQueries, setSavedQueries] = useState<string[]>(() =>
    getStoredQueries(SAVED_QUERY_KEY)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendationLoading, setRecommendationLoading] =
    useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const userName = getStoredUserName();

  const visibleResults = useMemo(() => {
    return filterByStatus(
      filterBySource(results, sourceFilter),
      statusFilter
    );
  }, [results, sourceFilter, statusFilter]);

  const resultCounts = useMemo(() => {
    return {
      total: results.length,
      documents: results.filter((result) => result.source === "documents")
        .length,
      plaintext: results.filter((result) => result.source === "plaintext")
        .length,
      ai: results.filter((result) => result.source === "ai").length,
    };
  }, [results]);

  const quickSearches = useMemo(() => {
    const terms = recommendedDocuments
      .flatMap((document) => [
        document.project?.name,
        document.category?.name,
        document.document_type,
      ])
      .filter((item): item is string => Boolean(item))
      .map((item) => item.trim())
      .filter(Boolean);

    const uniqueTerms = Array.from(new Set(terms));

    return uniqueTerms.slice(0, 4).length > 0
      ? uniqueTerms.slice(0, 4)
      : ["construction", "geological report", "certificate"];
  }, [recommendedDocuments]);

  async function loadRecommendations(): Promise<void> {
    try {
      setRecommendationLoading(true);

      const documents = await getDocuments({});

      const sortedDocuments = [...documents].sort((first, second) => {
        const firstTime = new Date(
          first.updated_at || first.created_at || 0
        ).getTime();
        const secondTime = new Date(
          second.updated_at || second.created_at || 0
        ).getTime();

        return secondTime - firstTime;
      });

      setRecommendedDocuments(sortedDocuments.slice(0, 4));
    } catch {
      setRecommendedDocuments([]);
    } finally {
      setRecommendationLoading(false);
    }
  }

  async function runSearch(searchQuery: string): Promise<void> {
    const cleanQuery = searchQuery.trim();

    if (!cleanQuery) {
      setAlert({
        type: "info",
        message:
          "Type a keyword, document code, project name, or document content.",
      });
      return;
    }

    try {
      setLoading(true);
      setAlert(null);
      setSubmittedQuery(cleanQuery);
      setSourceFilter("");
      setStatusFilter("");

      navigate(`/search?q=${encodeURIComponent(cleanQuery)}`, {
        replace: false,
      });

      const [documentMatches, plaintextMatches, aiMatches] = await Promise.all([
        getDocuments({ search: cleanQuery }),
        searchPlaintext(cleanQuery).catch(() => []),
        searchAiAnalysis(cleanQuery).catch(() => ({
          query: cleanQuery,
          total: 0,
          results: [],
        })),
      ]);

      const mergedResults = sortResults(
        deduplicateResults([
          ...buildDocumentResults(documentMatches),
          ...buildPlaintextResults(plaintextMatches),
          ...buildAiResults(aiMatches),
        ])
      );

      setResults(mergedResults);
      setRecentQueries(saveRecentQuery(cleanQuery));

      if (mergedResults.length === 0) {
        setAlert({
          type: "info",
          message:
            "No records matched this search. Try another keyword or confirm that plaintext extraction has been completed.",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Search failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event?: React.FormEvent<HTMLFormElement>): void {
    event?.preventDefault();
    runSearch(query);
  }

  function handleQuickSearch(value: string): void {
    setQuery(value);
    runSearch(value);
  }

  function handleSaveCurrentQuery(): void {
    if (!submittedQuery.trim()) {
      setAlert({
        type: "info",
        message: "Run a search before saving it.",
      });
      return;
    }

    setSavedQueries(saveSavedQuery(submittedQuery));
    setAlert({
      type: "success",
      message: "Search saved successfully on this browser.",
    });
  }

  function removeSavedQuery(value: string): void {
    const nextQueries = savedQueries.filter((item) => item !== value);

    setSavedQueries(nextQueries);
    setStoredQueries(SAVED_QUERY_KEY, nextQueries);
  }

  function clearSearch(): void {
    setQuery("");
    setSubmittedQuery("");
    setResults([]);
    setSourceFilter("");
    setStatusFilter("");
    setAlert(null);
    navigate("/search", { replace: true });
  }

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    const urlQuery = getQueryFromUrl(location.search);

    if (urlQuery && urlQuery !== submittedQuery) {
      setQuery(urlQuery);
      runSearch(urlQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const hasSearch = Boolean(submittedQuery || loading || results.length > 0);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[78px] shrink-0 items-center justify-between gap-5 border-b border-slate-200 bg-white px-5 lg:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-900">
              Search & Retrieval
            </h1>
            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
              Search document metadata, extracted text, and AI analysis
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <button
              type="button"
              className="flex items-center gap-3 rounded-xl px-1.5 py-1 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {getInitials(userName)}
              </div>

              <div className="hidden text-left lg:block">
                <p className="max-w-[150px] truncate text-sm font-semibold text-slate-800">
                  {userName}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Search Controller
                </p>
              </div>

              <ChevronDown
                size={14}
                className="hidden text-slate-400 lg:block"
              />
            </button>
          </div>
        </header>

        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] px-4 py-5 lg:px-8">
            <SearchRetrievalTabs />

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 lg:p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-lg">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <Sparkles size={14} />
                    Smart Search
                  </div>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                    Find the right document quickly
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter a title, project, document code, keyword, or text found
                    inside a document.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="w-full xl:max-w-3xl"
                >
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={20}
                    />

                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search documents, projects, codes, OCR text..."
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-36 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />

                    {query && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-[108px] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Clear search"
                      >
                        <X size={17} />
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute right-2 top-1/2 inline-flex h-10 -translate-y-1/2 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Search size={16} />
                      )}
                      Search
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Quick search
                    </span>

                    {quickSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleQuickSearch(item)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </form>
              </div>
            </section>

            {alert && (
              <AlertBox
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {hasSearch ? "Search Results" : "Recent Documents"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {loading
                        ? "Searching all available sources..."
                        : hasSearch
                        ? `${visibleResults.length} result(s) for “${submittedQuery}”`
                        : "Recently updated documents from the database"}
                    </p>
                  </div>

                  {hasSearch && (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        value={sourceFilter}
                        onChange={(event) =>
                          setSourceFilter(event.target.value)
                        }
                        className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-blue-400"
                      >
                        {sourceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.value
                              ? `${option.label} (${
                                  option.value === "documents"
                                    ? resultCounts.documents
                                    : option.value === "plaintext"
                                    ? resultCounts.plaintext
                                    : resultCounts.ai
                                })`
                              : `${option.label} (${resultCounts.total})`}
                          </option>
                        ))}
                      </select>

                      <select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value)
                        }
                        className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-blue-400"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleSaveCurrentQuery}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <Bookmark size={15} />
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="custom-scrollbar max-h-[620px] overflow-y-auto p-4">
                  {loading ? (
                    <div className="flex min-h-[340px] items-center justify-center gap-3 text-sm text-slate-500">
                      <Loader2 size={20} className="animate-spin" />
                      Searching metadata, OCR text, and AI analysis...
                    </div>
                  ) : hasSearch ? (
                    visibleResults.length > 0 ? (
                      <div className="space-y-3">
                        {visibleResults.map((result) => (
                          <SearchResultCard key={result.id} result={result} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="No results found"
                        text="Try another keyword, document code, project name, or extract plaintext from the document first."
                      />
                    )
                  ) : recommendationLoading ? (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="h-36 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
                        />
                      ))}
                    </div>
                  ) : recommendedDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {recommendedDocuments.map((document) => (
                        <RecommendedCard
                          key={String(document.id)}
                          document={document}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No document available"
                      text="Create a project and upload documents to start using smart search."
                    />
                  )}
                </div>
              </section>

              <aside className="space-y-5">
                <CompactQueryPanel
                  title="Recent Searches"
                  icon={<History size={17} />}
                  emptyText="Your recent searches will appear here."
                  queries={recentQueries.slice(0, 5)}
                  onSelect={handleQuickSearch}
                />

                <CompactQueryPanel
                  title="Saved Searches"
                  icon={<Bookmark size={17} />}
                  emptyText="Save an important search to access it later."
                  queries={savedQueries.slice(0, 5)}
                  onSelect={handleQuickSearch}
                  onRemove={removeSavedQuery}
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Search Coverage
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Available result sources
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Search size={18} />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <CoverageRow
                      icon={<FileText size={16} />}
                      label="Document metadata"
                      value={resultCounts.documents}
                    />
                    <CoverageRow
                      icon={<Database size={16} />}
                      label="Extracted text"
                      value={resultCounts.plaintext}
                    />
                    <CoverageRow
                      icon={<BrainCircuit size={16} />}
                      label="AI analysis"
                      value={resultCounts.ai}
                    />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SearchRetrievalTabs() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-200/40">
      {searchTabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === "/search"}
            className={({ isActive }) =>
              cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            <Icon size={16} />
            {tab.label}
          </NavLink>
        );
      })}
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50">
          {result.source === "documents"
            ? getFileIcon(result.document)
            : getSourceIcon(result.source)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold",
                getSourceClass(result.source)
              )}
            >
              {getSourceIcon(result.source)}
              {getSourceLabel(result.source)}
            </span>

            {result.status && (
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-bold",
                  getStatusClass(result.status)
                )}
              >
                {getReadableStatus(result.status)}
              </span>
            )}
          </div>

          <h4 className="mt-3 truncate text-sm font-bold text-slate-900">
            {result.title}
          </h4>

          <p className="mt-1 truncate text-xs text-slate-500">
            {result.subtitle}
          </p>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
            {result.description}
          </p>

          {result.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {result.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
          <span className="text-[11px] text-slate-400">
            {formatRelativeTime(result.updatedAt)}
          </span>

          <Link
            to="/alldocuments"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Eye size={14} />
            Open Library
          </Link>
        </div>
      </div>
    </article>
  );
}

function RecommendedCard({ document }: { document: DmsDocument }) {
  return (
    <Link
      to="/alldocuments"
      className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
          {getFileIcon(document)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-700">
              {getDocumentTitle(document)}
            </h4>

            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
              {getDocumentTypeLabel(document)}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
            {document.description || getDocumentSubtitle(document)}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-slate-400">
            <span className="flex min-w-0 items-center gap-1.5">
              <FolderOpen size={12} />
              <span className="truncate">
                {document.project?.name || "No project"}
              </span>
            </span>

            <span className="shrink-0">
              {formatRelativeTime(document.updated_at || document.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CompactQueryPanel({
  title,
  icon,
  emptyText,
  queries,
  onSelect,
  onRemove,
}: {
  title: string;
  icon: ReactNode;
  emptyText: string;
  queries: string[];
  onSelect: (query: string) => void;
  onRemove?: (query: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-center gap-2 text-slate-900">
        <span className="text-blue-600">{icon}</span>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>

      {queries.length > 0 ? (
        <div className="mt-4 space-y-2">
          {queries.map((item) => (
            <div
              key={item}
              className="group flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2"
            >
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="min-w-0 flex-1 truncate text-left text-xs font-medium text-slate-600 transition hover:text-blue-700"
              >
                {item}
              </button>

              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-white hover:text-red-600 group-hover:opacity-100"
                  aria-label={`Remove ${item}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs leading-5 text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}

function CoverageRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <span className="text-blue-600">{icon}</span>
        {label}
      </div>

      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

function AlertBox({
  type,
  message,
  onClose,
}: {
  type: AlertState["type"];
  message: string;
  onClose: () => void;
}) {
  const style =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-blue-200 bg-blue-50 text-blue-700";

  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "error"
      ? AlertCircle
      : ShieldCheck;

  return (
    <div
      className={cn(
        "mt-5 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
        style
      )}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 opacity-70 transition hover:opacity-100"
        aria-label="Close message"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Search size={24} />
      </div>

      <h4 className="mt-4 text-sm font-bold text-slate-800">{title}</h4>

      <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}
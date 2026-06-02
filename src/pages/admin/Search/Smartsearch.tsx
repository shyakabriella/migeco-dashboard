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
  {
    label: "Saved Searches",
    path: "/SavedSearch",
    icon: Bookmark,
  },
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

function formatDate(date?: string | null): string {
  if (!date) return "Not updated";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not updated";

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(date?: string | null): string {
  if (!date) return "unknown time";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "unknown time";

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
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
  if (source === "documents") return "Document Metadata";
  if (source === "plaintext") return "Extracted Text / OCR";
  return "AI Analysis";
}

function getSourceIcon(source: SearchSource): ReactNode {
  if (source === "plaintext") return <Database size={18} />;
  if (source === "ai") return <BrainCircuit size={18} />;
  return <FileText size={18} />;
}

function getStatusClass(status?: string | null): string {
  switch (toLower(status)) {
    case "active":
    case "clean":
    case "safe":
    case "extracted":
    case "encrypted":
    case "analyzed":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "uploaded":
    case "pending":
    case "pending_scan":
    case "scanning":
    case "not_tested":
    case "not_extracted":
    case "not_encrypted":
    case "not_analyzed":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
    case "quarantined":
    case "suspicious":
      return "border-orange-500/20 bg-orange-500/10 text-orange-300";
    case "infected":
    case "rejected":
    case "failed":
    case "unsafe":
    case "blocked":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    default:
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";
  }
}

function getFileIcon(document?: Partial<DmsDocument> | null): ReactNode {
  const extension = document?.extension?.toLowerCase();

  if (["jpg", "jpeg", "png", "webp", "tif", "tiff"].includes(extension || "")) {
    return <FileImage size={22} className="text-emerald-400" />;
  }

  if (["xls", "xlsx", "csv"].includes(extension || "")) {
    return <FileSpreadsheet size={22} className="text-green-400" />;
  }

  if (["dwg", "dxf", "zip", "rar"].includes(extension || "")) {
    return <FileArchive size={22} className="text-orange-400" />;
  }

  if (extension === "pdf") {
    return <FileText size={22} className="text-red-400" />;
  }

  return <FileText size={22} className="text-blue-400" />;
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

function makeSnippet(value?: string | null, fallback = "No content preview available."): string {
  if (!value) return fallback;

  const cleanValue = value.replace(/\s+/g, " ").trim();

  if (!cleanValue) return fallback;

  return cleanValue.length > 260 ? `${cleanValue.slice(0, 260)}...` : cleanValue;
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
      title: getDocumentTitle(document) || item.title || `Text result #${index + 1}`,
      subtitle: getDocumentSubtitle(document),
      description: makeSnippet(getPlaintextText(item), "Extracted text matched your search."),
      source: "plaintext",
      status: document?.status || "extracted",
      securityLevel: document?.security_level,
      updatedAt: item.updated_at || item.created_at || document?.updated_at || document?.created_at,
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
    const tags = getTagsFromValue(item.suggested_tags);

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
      securityLevel: String(item.sensitivity_level || document?.security_level || ""),
      updatedAt: item.updated_at || item.created_at || document?.updated_at || document?.created_at,
      tags,
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

  if (document?.document_type) return getReadableStatus(document.document_type);

  return "FILE";
}

export default function Smartsearch() {
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>(() => getQueryFromUrl(location.search));
  const [submittedQuery, setSubmittedQuery] = useState<string>(() =>
    getQueryFromUrl(location.search)
  );
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recommendedDocuments, setRecommendedDocuments] = useState<DmsDocument[]>([]);
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

  const visibleResults = useMemo(() => {
    return filterByStatus(filterBySource(results, sourceFilter), statusFilter);
  }, [results, sourceFilter, statusFilter]);

  const resultCounts = useMemo(() => {
    return {
      total: results.length,
      documents: results.filter((result) => result.source === "documents").length,
      plaintext: results.filter((result) => result.source === "plaintext").length,
      ai: results.filter((result) => result.source === "ai").length,
    };
  }, [results]);

  const trendingSearches = useMemo(() => {
    const terms = recommendedDocuments
      .flatMap((document) => [
        document.project?.name,
        document.category?.name,
        document.document_type,
        document.title,
      ])
      .filter((item): item is string => Boolean(item))
      .map((item) => item.trim())
      .filter(Boolean);

    const uniqueTerms = Array.from(new Set(terms));

    return uniqueTerms.slice(0, 3).length > 0
      ? uniqueTerms.slice(0, 3)
      : ["construction", "geological report", "certificate"];
  }, [recommendedDocuments]);

  async function loadRecommendations(): Promise<void> {
    try {
      setRecommendationLoading(true);

      const documents = await getDocuments({});

      const sortedDocuments = [...documents].sort((first, second) => {
        const firstTime = new Date(first.updated_at || first.created_at || 0).getTime();
        const secondTime = new Date(
          second.updated_at || second.created_at || 0
        ).getTime();

        return secondTime - firstTime;
      });

      setRecommendedDocuments(sortedDocuments.slice(0, 6));
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
        message: "Please type a keyword, document code, project name, or text to search.",
      });
      return;
    }

    try {
      setLoading(true);
      setAlert(null);
      setSubmittedQuery(cleanQuery);

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
            "No matching records were found. Try another word, document code, project name, or run plaintext extraction for your documents first.",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Search failed. Please try again.";

      setAlert({
        type: "error",
        message,
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
        message: "Run a search first, then save the query.",
      });
      return;
    }

    const nextSavedQueries = saveSavedQuery(submittedQuery);

    setSavedQueries(nextSavedQueries);
    setAlert({
      type: "success",
      message: "Search query saved on this browser.",
    });
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

  return (
    <div className="flex min-h-screen bg-[#0b0e14] font-sans text-gray-200">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#1e2532] px-8">
          <div>
            <h1 className="text-lg font-semibold">Search & Retrieval</h1>
            <p className="mt-0.5 text-xs text-gray-500">
              Search documents, extracted text, AI summaries, projects, and metadata
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Bell size={20} className="text-gray-400" />

            <div className="flex items-center gap-3 border-l border-[#1e2532] pl-4">
              <div className="text-right">
                <div className="text-sm font-medium">DMS User</div>
                <div className="text-xs text-gray-400">Search Controller</div>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1e2532] bg-indigo-600/20 text-xs font-semibold text-white">
                DU
              </div>

              <ChevronDown size={14} className="text-gray-500" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <SearchRetrievalTabs />

          <div className="mx-auto mt-10 max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
              <Search size={14} />
              Smart Search
            </div>

            <h2 className="mb-4 text-4xl font-bold">
              What are you looking for today?
            </h2>

            <p className="mb-8 text-gray-400">
              Search across document metadata, extracted document content, and AI analysis results.
            </p>

            <form onSubmit={handleSubmit} className="relative mb-4">
              <Search
                className="absolute left-4 top-3.5 text-gray-500"
                size={20}
              />

              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by keyword, project name, document code, title, or extracted content..."
                className="w-full rounded-xl border border-[#1e2532] bg-[#171c26] py-3 pl-12 pr-36 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />

              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-28 top-3 rounded-lg p-1 text-gray-500 hover:bg-[#1e2532] hover:text-white"
                >
                  <X size={18} />
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Search
              </button>
            </form>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="text-gray-500">TRENDING SEARCHES:</span>

              {trendingSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleQuickSearch(item)}
                  className="flex items-center gap-1 rounded-full border border-[#1e2532] bg-[#171c26] px-3 py-1.5 text-blue-400 transition-colors hover:bg-[#1e2532]"
                >
                  <span className="text-blue-500">↗</span>
                  {item}
                </button>
              ))}
            </div>

            {recentQueries.length > 0 && (
              <div className="mb-10 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
                <span className="text-[10px] leading-tight">
                  RECENT
                  <br />
                  QUERIES:
                </span>

                {recentQueries.slice(0, 3).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleQuickSearch(item)}
                    className="flex items-center gap-2 rounded-full border border-[#1e2532] bg-[#171c26] px-3 py-2 hover:text-gray-300"
                  >
                    <History size={14} />
                    &quot;{item}&quot;
                  </button>
                ))}
              </div>
            )}
          </div>

          {alert && (
            <AlertBox
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          {(submittedQuery || results.length > 0 || loading) && (
            <section className="mt-8 rounded-2xl border border-[#1e2532] bg-[#111620] p-5">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Search Results
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {loading
                      ? "Searching database..."
                      : `${visibleResults.length} result(s) for "${submittedQuery}"`}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    value={sourceFilter}
                    onChange={(event) => setSourceFilter(event.target.value)}
                    className="rounded-xl border border-[#1e2532] bg-[#171c26] px-3 py-2 text-sm text-gray-300 outline-none focus:border-blue-500"
                  >
                    <option value="">All Sources ({resultCounts.total})</option>
                    <option value="documents">Metadata ({resultCounts.documents})</option>
                    <option value="plaintext">Extracted Text ({resultCounts.plaintext})</option>
                    <option value="ai">AI Analysis ({resultCounts.ai})</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-xl border border-[#1e2532] bg-[#171c26] px-3 py-2 text-sm text-gray-300 outline-none focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="uploaded">Uploaded</option>
                    <option value="quarantined">Quarantined</option>
                    <option value="rejected">Rejected</option>
                    <option value="archived">Archived</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleSaveCurrentQuery}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/20"
                  >
                    <Bookmark size={16} />
                    Save Query
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-3 rounded-xl border border-[#1e2532] bg-[#171c26] p-10 text-sm text-gray-400">
                  <Loader2 size={20} className="animate-spin" />
                  Searching documents, plaintext, and AI analysis...
                </div>
              ) : visibleResults.length > 0 ? (
                <div className="space-y-3">
                  {visibleResults.map((result) => (
                    <SearchResultCard key={result.id} result={result} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No result found"
                  text="Try another keyword, check spelling, or extract plaintext/OCR first if you want content search."
                />
              )}
            </section>
          )}

          {!submittedQuery && results.length === 0 && (
            <RecommendedSection
              documents={recommendedDocuments}
              loading={recommendationLoading}
            />
          )}

          {savedQueries.length > 0 && (
            <section className="mt-10 rounded-2xl border border-[#1e2532] bg-[#111620] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Bookmark size={18} className="text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  Saved Searches
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">
                {savedQueries.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleQuickSearch(item)}
                    className="rounded-full border border-[#1e2532] bg-[#171c26] px-4 py-2 text-sm text-blue-300 hover:bg-[#1e2532]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function SearchRetrievalTabs() {
  return (
    <div className="rounded-2xl border border-[#1e2532] bg-[#171c26] p-2">
      <div className="flex flex-wrap items-center gap-2">
        {searchTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === "/search"}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-gray-400 hover:bg-[#1e2532] hover:text-white"
                )
              }
            >
              <Icon size={16} />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <div className="rounded-xl border border-[#1e2532] bg-[#171c26] p-5 transition-colors hover:border-blue-500/30">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#1e2532] bg-[#0b0e14]">
            {result.source === "documents"
              ? getFileIcon(result.document)
              : getSourceIcon(result.source)}
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-300">
                {getSourceLabel(result.source)}
              </span>

              {result.status && (
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px]",
                    getStatusClass(result.status)
                  )}
                >
                  {getReadableStatus(result.status)}
                </span>
              )}

              {result.securityLevel && (
                <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[11px] text-purple-300">
                  {getReadableStatus(result.securityLevel)}
                </span>
              )}
            </div>

            <h4 className="truncate text-base font-semibold text-white">
              {result.title}
            </h4>

            <p className="mt-1 text-xs text-gray-500">{result.subtitle}</p>

            <p className="mt-3 text-sm leading-6 text-gray-300">
              {result.description}
            </p>

            {result.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {result.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-blue-500/10 px-2 py-1 text-[11px] text-blue-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 xl:items-end">
          <span className="text-xs text-gray-500">
            Updated {formatDate(result.updatedAt)}
          </span>

          <Link
            to="/alldocuments"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1e2532] bg-[#0b0e14] px-3 py-2 text-sm text-gray-300 hover:border-blue-500/30 hover:text-white"
          >
            <Eye size={15} />
            Open Library
          </Link>
        </div>
      </div>
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
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : type === "error"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-blue-500/20 bg-blue-500/10 text-blue-300";

  const Icon =
    type === "success" ? CheckCircle2 : type === "error" ? AlertCircle : ShieldCheck;

  return (
    <div
      className={cn(
        "mx-auto mt-8 flex max-w-4xl items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm",
        style
      )}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>

      <button type="button" onClick={onClose} className="shrink-0 opacity-80">
        <X size={16} />
      </button>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#1e2532] bg-[#171c26] p-10 text-center">
      <Search size={28} className="mx-auto mb-3 text-gray-600" />
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {text}
      </p>
    </div>
  );
}

function RecommendedSection({
  documents,
  loading,
}: {
  documents: DmsDocument[];
  loading: boolean;
}) {
  return (
    <div className="mt-20">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          ✨ Recommended from Database
        </h3>

        <span className="rounded bg-[#171c26] px-3 py-1 text-xs text-gray-500">
          Based on recent uploaded documents
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-44 animate-pulse rounded-xl border border-[#1e2532] bg-[#171c26]"
            />
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {documents.slice(0, 3).map((document) => (
            <RecommendedCard key={String(document.id)} document={document} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No recommendation yet"
          text="Create a project first, upload documents, and they will appear here automatically."
        />
      )}
    </div>
  );
}

function RecommendedCard({ document }: { document: DmsDocument }) {
  return (
    <Link
      to="/alldocuments"
      className="rounded-xl border border-[#1e2532] bg-[#171c26] p-5 transition-colors hover:border-blue-500/30"
    >
      <div className="mb-4 flex items-start justify-between">
        {getFileIcon(document)}
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
          {getDocumentTypeLabel(document)}
        </span>
      </div>

      <h4 className="mb-2 truncate font-semibold">{getDocumentTitle(document)}</h4>

      <p className="mb-6 line-clamp-3 text-xs leading-5 text-gray-400">
        {document.description ||
          `${getDocumentSubtitle(document)} • ${getReadableStatus(document.status)}`}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={14} className="text-gray-500" />
          <span className="max-w-[150px] truncate text-[10px] text-gray-500">
            {document.project?.name || "No project"}
          </span>
        </div>

        <span className="text-[10px] text-gray-500">
          updated {formatRelativeTime(document.updated_at || document.created_at)}
        </span>
      </div>
    </Link>
  );
}
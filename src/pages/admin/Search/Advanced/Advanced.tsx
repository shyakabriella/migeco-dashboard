import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../AdminSidebar";
import Header from "./components/Header";
import FilterPanel from "./components/FilterPanel";
import SearchResults from "./components/SearchResults";
import {
  getDocumentCategories,
  getDocuments,
  getProjects,
  searchPlaintext,
} from "../../../../services/dmsApi";
import type {
  DmsDocument,
  DocumentCategory,
  ProjectSummary,
} from "../../../../services/dmsApi";

export type FilterOption = {
  label: string;
  value: string;
};

export type AdvancedFilterState = {
  projectId: string;
  categoryId: string;
  documentType: string;
  securityLevel: string;
  status: string;
  scanStatus: string;
  authorId: string;
  dateFrom: string;
  dateTo: string;
  searchWithinContent: boolean;
  includeArchived: boolean;
  keyword: string;
};

export const emptyAdvancedFilters: AdvancedFilterState = {
  projectId: "",
  categoryId: "",
  documentType: "",
  securityLevel: "",
  status: "",
  scanStatus: "",
  authorId: "",
  dateFrom: "",
  dateTo: "",
  searchWithinContent: true,
  includeArchived: false,
  keyword: "",
};

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
};

function toLower(value?: string | null): string {
  return value ? String(value).toLowerCase() : "";
}

function getReadableStatus(value?: string | null): string {
  if (!value) return "Unknown";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getTags(document: DmsDocument): string[] {
  if (Array.isArray(document.tags)) {
    return document.tags.filter((tag): tag is string => typeof tag === "string");
  }

  if (typeof document.tags === "string") {
    return document.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function sortByDate(documents: DmsDocument[]): DmsDocument[] {
  return [...documents].sort((first, second) => {
    const firstDate = new Date(first.updated_at || first.created_at || 0).getTime();
    const secondDate = new Date(
      second.updated_at || second.created_at || 0
    ).getTime();

    return secondDate - firstDate;
  });
}

function makeProjectOptions(projects: ProjectSummary[]): FilterOption[] {
  return projects.map((project) => ({
    label: project.name,
    value: String(project.id),
  }));
}

function makeCategoryOptions(categories: DocumentCategory[]): FilterOption[] {
  return categories.map((category) => ({
    label: category.name,
    value: String(category.id),
  }));
}

function makeDocumentTypeOptions(documents: DmsDocument[]): FilterOption[] {
  const values = Array.from(
    new Set(
      documents
        .map((document) => document.document_type || document.extension)
        .filter((value): value is string => Boolean(value))
    )
  );

  return values.map((value) => ({
    label: getReadableStatus(value),
    value,
  }));
}

function makeAuthorOptions(documents: DmsDocument[]): FilterOption[] {
  const uploaders = new Map<string, string>();

  documents.forEach((document) => {
    if (document.uploader?.id && document.uploader?.name) {
      uploaders.set(String(document.uploader.id), document.uploader.name);
    }
  });

  return Array.from(uploaders.entries()).map(([value, label]) => ({
    value,
    label,
  }));
}

function keywordMatches(document: DmsDocument, keyword: string): boolean {
  const cleanKeyword = keyword.trim().toLowerCase();

  if (!cleanKeyword) return true;

  const searchableText = [
    document.title,
    document.original_file_name,
    document.document_code,
    document.description,
    document.document_type,
    document.extension,
    document.security_level,
    document.status,
    document.scan_status,
    document.sandbox_status,
    document.encryption_status,
    document.plaintext_status,
    document.ai_status,
    document.project?.name,
    document.project?.code,
    document.category?.name,
    document.uploader?.name,
    ...getTags(document),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(cleanKeyword);
}

function dateMatches(
  document: DmsDocument,
  dateFrom: string,
  dateTo: string
): boolean {
  if (!dateFrom && !dateTo) return true;

  const documentDate = new Date(document.updated_at || document.created_at || "");

  if (Number.isNaN(documentDate.getTime())) return false;

  if (dateFrom) {
    const fromDate = new Date(`${dateFrom}T00:00:00`);
    if (documentDate < fromDate) return false;
  }

  if (dateTo) {
    const toDate = new Date(`${dateTo}T23:59:59`);
    if (documentDate > toDate) return false;
  }

  return true;
}

function getPlaintextMatchedIds(response: unknown): Set<string> {
  const rows = Array.isArray(response) ? response : [];
  const ids = new Set<string>();

  rows.forEach((row) => {
    if (!row || typeof row !== "object") return;

    const item = row as {
      id?: number | string;
      document_id?: number | string;
      document?: {
        id?: number | string;
      } | null;
    };

    const id = item.document_id || item.document?.id || item.id;

    if (id) {
      ids.add(String(id));
    }
  });

  return ids;
}

function applyFiltersToDocuments(
  documents: DmsDocument[],
  filters: AdvancedFilterState,
  plaintextMatchedIds: Set<string>
): DmsDocument[] {
  return sortByDate(
    documents.filter((document) => {
      if (
        filters.projectId &&
        String(document.project_id || document.project?.id || "") !==
          filters.projectId
      ) {
        return false;
      }

      if (
        filters.categoryId &&
        String(document.document_category_id || document.category?.id || "") !==
          filters.categoryId
      ) {
        return false;
      }

      if (
        filters.documentType &&
        String(document.document_type || document.extension || "") !==
          filters.documentType
      ) {
        return false;
      }

      if (
        filters.securityLevel &&
        toLower(document.security_level) !== toLower(filters.securityLevel)
      ) {
        return false;
      }

      if (filters.status && toLower(document.status) !== toLower(filters.status)) {
        return false;
      }

      if (
        filters.scanStatus &&
        toLower(document.scan_status) !== toLower(filters.scanStatus)
      ) {
        return false;
      }

      if (
        filters.authorId &&
        String(document.uploader?.id || "") !== String(filters.authorId)
      ) {
        return false;
      }

      if (!filters.includeArchived && toLower(document.status) === "archived") {
        return false;
      }

      if (!dateMatches(document, filters.dateFrom, filters.dateTo)) {
        return false;
      }

      if (!keywordMatches(document, filters.keyword)) {
        if (
          !filters.searchWithinContent ||
          !plaintextMatchedIds.has(String(document.id))
        ) {
          return false;
        }
      }

      return true;
    })
  );
}

export default function Advancedfilter() {
  const [filters, setFilters] =
    useState<AdvancedFilterState>(emptyAdvancedFilters);

  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [results, setResults] = useState<DmsDocument[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const projectOptions = useMemo(() => makeProjectOptions(projects), [projects]);
  const categoryOptions = useMemo(
    () => makeCategoryOptions(categories),
    [categories]
  );
  const documentTypeOptions = useMemo(
    () => makeDocumentTypeOptions(documents),
    [documents]
  );
  const authorOptions = useMemo(() => makeAuthorOptions(documents), [documents]);

  async function loadData(): Promise<void> {
    try {
      setLoading(true);
      setAlert(null);

      const [documentsData, projectsData, categoriesData] = await Promise.all([
        getDocuments({}),
        getProjects({}),
        getDocumentCategories({}),
      ]);

      const sortedDocuments = sortByDate(documentsData);
      const visibleDocuments = sortedDocuments.filter(
        (document) => toLower(document.status) !== "archived"
      );

      setDocuments(sortedDocuments);
      setResults(visibleDocuments);
      setProjects(projectsData);
      setCategories(categoriesData);
      setCurrentPage(1);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load documents, projects, and categories.",
      });
    } finally {
      setLoading(false);
    }
  }

  function updateFilter<K extends keyof AdvancedFilterState>(
    field: K,
    value: AdvancedFilterState[K]
  ): void {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function applyFilters(): Promise<void> {
    try {
      setApplying(true);
      setAlert(null);

      let plaintextMatchedIds = new Set<string>();

      if (filters.keyword.trim() && filters.searchWithinContent) {
        const plaintextResponse = await searchPlaintext(filters.keyword.trim()).catch(
          () => []
        );

        plaintextMatchedIds = getPlaintextMatchedIds(plaintextResponse);
      }

      const filteredDocuments = applyFiltersToDocuments(
        documents,
        filters,
        plaintextMatchedIds
      );

      setResults(filteredDocuments);
      setCurrentPage(1);

      if (filteredDocuments.length === 0) {
        setAlert({
          type: "info",
          message:
            "No documents matched your filters. Try changing project, date, status, or keyword.",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to apply filters. Please try again.",
      });
    } finally {
      setApplying(false);
    }
  }

  function resetFilters(): void {
    setFilters(emptyAdvancedFilters);
    setResults(
      documents.filter((document) => toLower(document.status) !== "archived")
    );
    setCurrentPage(1);
    setAlert(null);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d1117] text-white">
      <AdminSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          totalDocuments={documents.length}
          resultCount={results.length}
          loading={loading}
          onRefresh={loadData}
        />

        <main className="flex-1 space-y-4 overflow-y-auto p-6">
          {alert && (
            <div
              className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                alert.type === "error"
                  ? "border-red-500/20 bg-red-500/10 text-red-300"
                  : alert.type === "success"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-blue-500/20 bg-blue-500/10 text-blue-300"
              }`}
            >
              <span>{alert.message}</span>

              <button
                type="button"
                onClick={() => setAlert(null)}
                className="text-white/70 hover:text-white"
              >
                ×
              </button>
            </div>
          )}

          <FilterPanel
            filters={filters}
            projects={projectOptions}
            categories={categoryOptions}
            documentTypes={documentTypeOptions}
            authors={authorOptions}
            loading={loading || applying}
            onChange={updateFilter}
            onApply={applyFilters}
            onReset={resetFilters}
          />

          <SearchResults
            results={results}
            loading={loading || applying}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </main>
      </div>
    </div>
  );
}
// api.ts
import { type TransactionRow } from "../types/TransactionRow";
import type { SetUndoRedo } from "@/types/SetUndoRedoType";
import { preprocessServerRows } from "@/utils/preprocessServerRows";

// Utility: helper function to handle response
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || response.statusText || "Unknown error occurred"
    );
  }
  return response.json();
}
// Utility: Standardized API requests
async function fetchAPI<T>(url: string, options: RequestInit = {}): Promise<T> {
  console.log("fetchAPI", url, options);
  const response = await fetch(url, options);
  return handleResponse<T>(response);
}

// most functions need to call getUndoRedo at the end
async function performWithUndoRedo(
  action: () => Promise<any>,
  setUndoRedo: SetUndoRedo
) {
  const result = await action();
  await getUndoRedo(setUndoRedo);
  return result;
}

// Fetch transactions
async function fetchTransactions(
  setUndoRedo: SetUndoRedo
): Promise<TransactionRow[]> {
  const rows = await fetchAPI<TransactionRow[]>("/api/transactions");
  console.log("got rows", rows);
  await getUndoRedo(setUndoRedo);
  return rows;
}

// all CRUD operations in table
export enum Operation {
  update = "update",
  delete = "delete",
  finalize = "finalize",
}
async function updateTransaction(
  operation: Operation,
  row: TransactionRow,
  setUndoRedo: SetUndoRedo
): Promise<TransactionRow | void> {
  if (!row.finalized) return;
  return performWithUndoRedo(
    () =>
      fetchAPI<TransactionRow>("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation, row }),
      }),
    setUndoRedo
  );
}

// CSV operation1: download current table as CSV
async function downloadCSV() {
  try {
    // skips our fetchAPI function because we aren't using JSON here
    const response = await fetch("/api/download-csv");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to download CSV");
    }

    // Get filename from response headers if available
    const contentDisposition = response.headers.get("content-disposition");
    let filename = "transactions.csv";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading CSV:", error);
    throw error;
  }
}

// CSV operation2: upload CSV to replace entire table
async function uploadCSV(
  formData: FormData,
  setUndoRedo: SetUndoRedo
): Promise<TransactionRow[]> {
  return performWithUndoRedo(
    () =>
      fetchAPI<TransactionRow[]>("/api/upload-csv", {
        method: "POST",
        body: formData,
      }),
    setUndoRedo
  );
}

// Undo and Redo
// These functions have setUndoRedo baked into the caller buttons
interface HistoryData {
  table: TransactionRow[];
  redo: string;
  undo: string;
}
async function undo(): Promise<HistoryData> {
  return fetchAPI<HistoryData>("/api/undo", { method: "POST" });
}
async function redo(): Promise<HistoryData> {
  return fetchAPI<HistoryData>("/api/redo", { method: "POST" });
}

// Get UndoRedo
// This fills in the undo and redo buttons with their next action
interface UndoRedoResponse {
  undo: string;
  redo: string;
}
async function getUndoRedo(
  setUndoRedo: SetUndoRedo
): Promise<UndoRedoResponse> {
  const { undo, redo } = await fetchAPI<UndoRedoResponse>("/api/undo-redo");
  setUndoRedo(undo, redo);
  return { undo, redo };
}

export const API = {
  fetchTransactions,
  updateTransaction,
  downloadCSV,
  uploadCSV,
  undo,
  redo,
  getUndoRedo,
};

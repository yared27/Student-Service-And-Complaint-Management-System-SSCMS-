import { useEffect, useRef, useState } from "react";
import { Download, Upload, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getImportBatch, listImportHistory, uploadStudentImport } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ImportStudents() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  async function loadHistory() {
    setLoading(true);
    try {
      const response = await listImportHistory(null, { limit: 10 });
      setHistory(response.items || []);
    } catch (error) {
      toast.error(error?.message || "Unable to load import history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function submitImport(event) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      toast.error("Please choose a CSV or XLSX file to upload.");
      return;
    }

    setUploading(true);
    try {
      const response = await uploadStudentImport(null, file);
      toast.success(response?.message || "Import completed.");
      setSelectedBatch(response.batch || null);
      await loadHistory();
    } catch (error) {
      toast.error(error?.message || "Failed to import file.");
    } finally {
      setUploading(false);
    }
  }

  async function showBatch(batchId) {
    try {
      const response = await getImportBatch(null, batchId);
      setSelectedBatch(response.batch || null);
    } catch (error) {
      toast.error(error?.message || "Unable to fetch import details.");
    }
  }

  return (
    <DashboardLayout role="admin" topLinks={[{ to: "/admin/dashboard", label: "Dashboard" }, { to: "/admin/reports", label: "Reports" }, { to: "/admin/users", label: "Users" }, { to: "/admin/analytics/logs", label: "Logs" }, { to: "/admin/import-students", label: "Student Import", end: true }]} user={user || {}}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Student imports</p>
            <h1 className="mt-2 text-3xl font-bold">Import Student Directory</h1>
            <p className="mt-2 text-sm text-muted-foreground">Upload a CSV or XLSX roster and keep a history of import batches.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadHistory}>
              <RefreshCcw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden rounded-3xl border bg-card p-6 shadow-card">
          <form className="grid gap-4 sm:grid-cols-[1.4fr_auto]" onSubmit={submitImport}>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Roster file</Label>
                <Input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" />
              </div>
              <p className="text-sm text-muted-foreground">The file should contain a student ID, name, email, campus, and department for each student.</p>
            </div>
            <Button type="submit" disabled={uploading} className="h-fit min-h-[3rem]">
              <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </Card>

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card className="overflow-hidden rounded-3xl border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Import history</p>
                <h2 className="mt-1 text-xl font-semibold">Recent batches</h2>
              </div>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading history...</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No previous import batches found.</p>
              ) : (
                history.map((batch) => (
                  <button
                    key={batch.id}
                    type="button"
                    onClick={() => showBatch(batch.id)}
                    className="w-full rounded-3xl border border-border p-4 text-left transition hover:border-primary/50"
                  >
                    <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                      <span>{batch.fileName}</span>
                      <span className="text-muted-foreground">{new Date(batch.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <span className="rounded-full bg-muted px-2 py-1 text-[11px] uppercase tracking-[0.2em]">Imported {batch.importedCount}</span>
                      <span className="rounded-full bg-destructive/10 px-2 py-1 text-[11px] uppercase tracking-[0.2em]">Failed {batch.failedCount}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] uppercase tracking-[0.2em]">Skipped {batch.skippedCount}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>

          <Card className="overflow-hidden rounded-3xl border bg-card p-6 shadow-card">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Batch details</p>
              <h2 className="mt-1 text-xl font-semibold">Selected batch</h2>
            </div>
            {selectedBatch ? (
              <div className="space-y-4">
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-secondary/40 p-4">
                    <p className="text-sm text-muted-foreground">File</p>
                    <p className="font-medium">{selectedBatch.fileName}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl bg-secondary/40 p-4">
                      <p className="text-sm text-muted-foreground">Imported</p>
                      <p className="font-medium">{selectedBatch.importedCount}</p>
                    </div>
                    <div className="rounded-2xl bg-secondary/40 p-4">
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="font-medium">{selectedBatch.failedCount}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Errors</p>
                  {selectedBatch.errors.length > 0 ? (
                    <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl bg-muted/50 p-4 text-sm">
                      {selectedBatch.errors.slice(0, 8).map((error, index) => (
                        <div key={index} className="mb-3 rounded-2xl border border-border bg-background p-3">
                          <p className="font-medium">Row {error.row}</p>
                          <p className="text-sm text-muted-foreground">{error.reason}</p>
                        </div>
                      ))}
                      {selectedBatch.errors.length > 8 ? <p className="text-xs text-muted-foreground">Only first 8 errors are shown.</p> : null}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No errors found for this batch.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a batch to inspect details.</p>
            )}
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}

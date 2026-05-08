import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMisuseReport } from "@/lib/api";

const REASONS = [
  { value: "FALSE_INFORMATION", label: "False information" },
  { value: "ABUSIVE_LANGUAGE", label: "Abusive language" },
  { value: "DUPLICATE_SPAM", label: "Duplicate / spam request" },
  { value: "SPAM", label: "Spam" },
  { value: "OTHER", label: "Other" },
];

export default function ReportStudentDialog({
  open,
  onOpenChange,
  defaultStudentId = "",
  complaintId,
  serviceRequestId,
  contextLabel = "request",
}) {
  const [studentId, setStudentId] = useState(defaultStudentId);
  const [reason, setReason] = useState("FALSE_INFORMATION");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStudentId(defaultStudentId || "");
    setReason("FALSE_INFORMATION");
    setDetails("");
  }, [defaultStudentId, open]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedStudentId = String(studentId || "").trim();
    if (!trimmedStudentId) {
      toast.error("Student ID is required.");
      return;
    }

    setSubmitting(true);
    try {
      await createMisuseReport(null, {
        studentId: trimmedStudentId,
        reason,
        details,
        complaintId,
        serviceRequestId,
      });

      toast.success("Student reported successfully. Admin will review it.");
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report Student</DialogTitle>
          <DialogDescription>
            Report a student for an unnecessary or illegal {contextLabel}. The student ID will be shown to admins for accountability.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="student-id">Student ID</Label>
            <Input
              id="student-id"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              placeholder="NSR/123/2026"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <select
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {REASONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={4}
              placeholder="Add supporting details for the admin review"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
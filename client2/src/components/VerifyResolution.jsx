import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function toImageList(source) {
  if (!Array.isArray(source)) {
    return [];
  }

  return source.filter((item) => typeof item === "string" || item?.url).map((item) => (typeof item === "string" ? item : item.url));
}

export default function VerifyResolution({ reqId, open, onOpenChange, onVerified }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!open || !reqId) {
      return;
    }

    let active = true;

    async function loadDetails() {
      setLoading(true);
      try {
        const primary = await fetch(`/api/requests/${reqId}/verify`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        let payload;

        if (primary.ok) {
          payload = await primary.json();
        } else {
          const fallback = await fetch(`/api/requests/${reqId}`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (!fallback.ok) {
            throw new Error("Unable to load resolution details.");
          }

          payload = await fallback.json();
        }

        if (!active) {
          return;
        }

        setDetails(payload?.data || payload || null);
      } catch (error) {
        toast.error(error.message || "Unable to load verification details.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [open, reqId, token]);

  const notes = useMemo(() => details?.staffNotes || details?.notes || "No staff notes provided.", [details]);
  const beforeImages = useMemo(() => toImageList(details?.beforePhotos || details?.before || []), [details]);
  const afterImages = useMemo(() => toImageList(details?.afterPhotos || details?.after || []), [details]);

  async function verify(decision) {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/requests/${reqId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ decision }),
      });

      if (!response.ok) {
        throw new Error("Verification update failed.");
      }

      toast.success(decision === "approve" ? "Request approved and closed." : "Request rejected and sent for reassignment.");
      onOpenChange?.(false);
      onVerified?.(decision);
    } catch (error) {
      toast.error(error.message || "Unable to submit verification.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Verify Resolution</DialogTitle>
          <DialogDescription>Request ID: {reqId}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-sm text-muted-foreground">Loading resolution details...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">Staff Notes</h3>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3">Before</h3>
                {beforeImages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No before photos.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {beforeImages.map((src, idx) => (
                      <img
                        key={`${src}-${idx}`}
                        src={src}
                        alt={`Before ${idx + 1}`}
                        className="h-28 w-full rounded-md object-cover border"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3">After</h3>
                {afterImages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No after photos.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {afterImages.map((src, idx) => (
                      <img
                        key={`${src}-${idx}`}
                        src={src}
                        alt={`After ${idx + 1}`}
                        className="h-28 w-full rounded-md object-cover border"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button className="bg-destructive hover:bg-destructive/90" onClick={() => verify("reject")} disabled={submitting || loading}>
            Reject
          </Button>
          <Button className="bg-success text-white hover:bg-success/90" onClick={() => verify("approve")} disabled={submitting || loading}>
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

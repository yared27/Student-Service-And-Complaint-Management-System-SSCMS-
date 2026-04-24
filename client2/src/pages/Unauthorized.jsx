import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-card text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <ShieldX className="w-7 h-7" />
        </div>
        <h1 className="mt-5 text-2xl font-display font-bold">Unauthorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link to="/student"></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

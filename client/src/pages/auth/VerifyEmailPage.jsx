import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const mockEmail = "service.manager@amu.edu.et";

  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-5">
          <AuthHeader
            title="Verify your university email"
            description="Service Managers must verify @amu.edu.et before full access."
          />

          <Alert variant="info" title="Email in review">
            {mockEmail}
          </Alert>

          {message ? <Alert variant="success">{message}</Alert> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={() => navigate("/service-manager")}>I have verified</Button>
            <Button
              variant="secondary"
              onClick={() => setMessage("Verification email has been resent (mock).")}
            >
              Resend verification email
            </Button>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

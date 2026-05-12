import { AlertCircle, CheckCircle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmationDialog({
  open = false,
  onOpenChange = () => {},
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  type = "warning", // warning, danger, success, info
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm = () => {},
  onCancel = () => {},
  loading = false,
}) {
  const typeConfig = {
    warning: {
      icon: AlertCircle,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-50",
      confirmBtnClass: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    danger: {
      icon: AlertCircle,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
      confirmBtnClass: "bg-red-600 hover:bg-red-700 text-white",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      confirmBtnClass: "bg-green-600 hover:bg-green-700 text-white",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      confirmBtnClass: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className={`w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-base mt-2">{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-3">
          <button
            onClick={() => {
              onCancel();
              onOpenChange(false);
            }}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-foreground disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${config.confirmBtnClass}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useConfirmationDialog() {
  const [open, setOpen] = require("react").useState(false);
  const [config, setConfig] = require("react").useState({
    title: "Confirm Action",
    description: "Are you sure?",
    type: "warning",
  });

  const showConfirmation = (options) => {
    setConfig(options);
    setOpen(true);
  };

  return {
    open,
    setOpen,
    config,
    showConfirmation,
  };
}

import Button from "@/components/ui/_shared/button/button";
import toast from "react-hot-toast";
import {SmileyIcon, SmileySadIcon, WarningIcon, XIcon} from "@phosphor-icons/react/ssr";

interface ToastProps {
  t: any;
  title: string;
  message?: string;
  type: "error" | "success" | "warning" | "default";
  duration?: number;
  invoke?: () => void;
}

const iconMap: Record<string, { icon: React.ComponentType<any>, className: string }> = {
  error: {
    icon: SmileySadIcon,
    className: "text-red-500"
  },
  success: {
    icon: SmileyIcon,
    className: "text-green-500"
  },
  warning: {
    icon: WarningIcon,
    className: "text-yellow-500"
  }
};

export default function Toast({t, title, message = "", type = "default", invoke}: ToastProps) {
  const icon = iconMap[type];

  return (
    <div className={`flex max-w-lg items-start justify-between rounded-md border shadow-lg bg-surface-0 px-4 py-3 select-none space-x-4
         ${t.visible
      ? "animate-in fade-in slide-in-from-bottom duration-300"
      : "animate-out fade-out slide-out-to-bottom duration-200"
    }`}
    >
      <div className={`flex h-full items-center justify-center
        ${type}
      `}
      >
        {icon && <icon.icon className={icon.className} size={24} weight={"bold"}/>}
      </div>

      <div className={`flex flex-col h-full ${!message && "justify-center items-center"}`}>
        <p className="text-sm font-medium">{title}</p>

        {message && <p className="mt-1 text-xs text-foreground/80">{message}</p>}
      </div>

      <Button
        variant="ghost"
        size="auto"
        className="aspect-square w-8"
        onClick={() => {
          if(invoke) invoke();
          toast.dismiss(t.id)
          toast.remove(t.id)
        }}
      >
        <XIcon size={18}/>
      </Button>
    </div>
  )
}
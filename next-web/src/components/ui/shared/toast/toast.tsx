import Button from "@/components/ui/shared/button/button";
import toast from "react-hot-toast";
import {SmileyIcon, SmileySadIcon, XIcon} from "@phosphor-icons/react/ssr";

interface ToastProps {
  t: any;
  title: string;
  message?: string;
  type: "error" | "success" | "default";
  duration?: number;
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
};

export default function Toast({t, title, message = "", type = "default"}: ToastProps) {
  const icon = iconMap[type];

  return (
    <div className={`flex max-w-lg items-start justify-between rounded-md border shadow-lg bg-surface-0 px-4 py-3 select-none
         ${t.visible
      ? "animate-in fade-in slide-in-from-bottom duration-300"
      : "animate-out fade-out slide-out-to-bottom duration-200"
    }`}
    >
      <div className={`mr-4 flex h-full items-center justify-center
        ${type}
      `}
      >
        {icon && <icon.icon className={icon.className} size={24} weight={"bold"}/>}
      </div>

      <div>
        <p className="text-sm font-medium">{title}</p>

        <p className="mt-1 text-xs text-foreground/80">{message}</p>
      </div>

      <Button
        variant="ghost"
        size="auto"
        className="aspect-square w-8"
        onClick={() => {
          localStorage.setItem("zone-dismiss", "true");
          toast.dismiss(t.id)
        }}
      >
        <XIcon size={18}/>
      </Button>
    </div>
  )
}
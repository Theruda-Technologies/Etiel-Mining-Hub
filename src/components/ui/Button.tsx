import { Link } from "@/i18n/navigation";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-amber text-basalt-deep hover:bg-amber-bright border border-transparent",
  secondary:
    "bg-transparent text-white border border-white/80 hover:border-white hover:bg-white/5",
  ghost:
    "bg-transparent text-white border border-white/20 hover:border-amber hover:text-amber",
};

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
};

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold tracking-wide transition-colors ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

import Image from "next/image";
import { Link } from "@/i18n/navigation";

const LOGO_SRC = "/images/etiel-site-images/Etiel-Logo.png";

type SiteLogoProps = {
  /** Visual height in pixels */
  height?: number;
  className?: string;
  priority?: boolean;
  /** When false, render image only (e.g. already inside a link) */
  linked?: boolean;
};

export function SiteLogo({
  height = 44,
  className = "",
  priority = false,
  linked = true,
}: SiteLogoProps) {
  const width = Math.round(height * 1.05);

  const image = (
    <Image
      src={LOGO_SRC}
      alt="Etiel Mining Hub"
      width={width}
      height={height}
      priority={priority}
      className={`w-auto object-contain ${className}`}
      style={{ height, width: "auto" }}
    />
  );

  if (!linked) return image;

  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
      aria-label="Etiel Mining Hub"
    >
      {image}
    </Link>
  );
}

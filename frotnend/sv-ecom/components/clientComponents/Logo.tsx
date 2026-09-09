import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";

const Logo = ({ w = "15" }) => {
  const { data: theme } = useTheme();
  const logoUrl = typeof theme?.logo === "string" ? theme.logo.trim() : "";

  return (
    <Link
      href="/"
      className="text-2xl font-black tracking-tighter transition-opacity hover:opacity-80"
      style={{ color: "var(--primary)" }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="logo"
          className={`w-${w} h-auto object-contain`}
        />
      ) : (
        <span className="text-lg font-black tracking-tight">Lumina</span>
      )}
    </Link>
  );
};

export default Logo;

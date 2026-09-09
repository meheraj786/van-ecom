import "@/app/globals.css";
import { Providers } from "./providers";
import DynamicFavicon from "@/components/DynamicFavicon";

export const metadata = {
  title: "My Application",
  description: "Built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* <head>
        <DynamicFavicon />
      </head> */}
      <body>
        <Providers>
          <DynamicFavicon />
          {children}
        </Providers>
      </body>
    </html>
  );
}

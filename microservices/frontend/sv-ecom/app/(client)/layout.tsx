import ChatWidget from "@/components/clientComponents/chat/chatWidget";
import Footer from "@/components/clientComponents/home/Footer";
import Navbar from "@/components/clientComponents/home/Navbar";
import { ClientWidgetBoundary } from "@/components/ClientWidgetBoundary";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar always at the top */}

      <ClientWidgetBoundary name="navbar">
        <Navbar />
      </ClientWidgetBoundary>

      {/* Dynamic Content */}
      <main className="flex-grow pt-5 md:pt-20">{children}</main>
      <ClientWidgetBoundary name="chat">
        <ChatWidget />
      </ClientWidgetBoundary>
      {/* Footer at the bottom */}
      <ClientWidgetBoundary name="footer">
        <Footer />
      </ClientWidgetBoundary>
    </div>
  );
}

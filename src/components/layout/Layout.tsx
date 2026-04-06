import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { IdlePopup } from "@/components/IdlePopup";

interface LayoutProps {
  children: ReactNode;
  hideNavbar?: boolean;
  hideFooter?: boolean;
}

export function Layout({ children, hideNavbar = false, hideFooter = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className={!hideNavbar ? "pt-16 md:pt-20" : ""}>
        {children}
      </main>
      {!hideFooter && <Footer />}
      <IdlePopup />
    </div>
  );
}

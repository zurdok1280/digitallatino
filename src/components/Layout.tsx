import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LoginButton } from "@/components/LoginButton";
import { SearchArtist } from "./ui/searchArtist";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <main className="flex-1">
          {/* Header with sidebar trigger and login */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/20 p-4">
            <div className="flex items-center justify-between">
              <SidebarTrigger />
              <SearchArtist />
              <LoginButton />
            </div>
          </div>

          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
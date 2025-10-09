import { Home, Music, BarChart3, Settings, Headphones, Sparkles, LayoutDashboard } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navigation = [
  { title: "Weekly Top Songs", url: "/weekly-top-songs", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiresAuth: true },
  { title: "Top Platforms", url: "/top-platforms", icon: BarChart3 },
  { title: "Top Artists", url: "/top-artists", icon: Headphones },
  { title: "Debut", url: "/debut", icon: Sparkles },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 bg-gradient-sidebar border-r border-white/10`}
      collapsible="icon"
    >
      <SidebarContent className="bg-transparent">
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          {!isCollapsed ? (
            <img
              src="/lovable-uploads/9f002b3b-a058-45e4-9078-ed8fe5e40320.png"
              alt="Digital Latino"
              className="h-8 w-auto"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60 text-xs uppercase tracking-wider px-6 py-4">
            {!isCollapsed && "Navegación"}
          </SidebarGroupLabel>

          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {navigation
                .filter(item => !item.requiresAuth || user) // Mostrar Dashboard solo si está loggeado
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                      group transition-all duration-200 rounded-lg mb-1
                      ${isActive(item.url)
                          ? 'bg-white/20 text-white shadow-glass border border-white/20'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                        }
                    `}
                    >
                      <NavLink to={item.url} end={item.url === '/'}>
                        <item.icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 transition-colors`} />
                        {!isCollapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile Section */}
        <div className="mt-auto p-4 border-t border-white/10">
          <div className={`flex items-center gap-3 p-3 rounded-lg bg-white/10 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/40 to-white/20 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="text-white">
                <p className="text-sm font-medium">
                  {user?.email?.split('@')[0] || 'Usuario'}
                </p>
                <p className="text-xs text-white/60">
                  {user ? 'Miembro' : 'Invitado'}
                </p>
              </div>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
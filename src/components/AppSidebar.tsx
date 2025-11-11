import { Home, Music, BarChart3, Settings, Headphones, Sparkles, LayoutDashboard, Crown} from 'lucide-react';

import { Link, NavLink, useLocation} from 'react-router-dom';
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

type NavItem = {
  title: string;
  url: string;
  icon: typeof Home;
  requiresAuth?: boolean;
};

const navigation: NavItem[] = [
  { title: "Weekly Top Songs", url: "/weekly-top-songs", icon: Home },
 // { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiresAuth: true },
  { title: "Top Platforms", url: "/top-platforms", icon: BarChart3, requiresAuth: true},
  { title: "Top Artists", url: "/top-artists", icon: Headphones, requiresAuth: true },
  { title: "Debut", url: "/debut", icon: Sparkles, requiresAuth: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, setShowLoginDialog } = useAuth();
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
         <Link
            to="/weekly-top-songs"
            className="p-6 border-b border-white/10 block"
            >
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
          </Link>
        

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60 text-xs uppercase tracking-wider px-6 py-4">
            {!isCollapsed && "Navegación"}
          </SidebarGroupLabel>

          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {navigation
                //.filter(item => !item.requiresAuth || user) // Mostrar Dashboard solo si está loggeado
                .map((item) => {
                  const isLocked = item.requiresAuth && !user;
                  return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                     asChild={!isLocked}
                     onClick={isLocked ? () => setShowLoginDialog(true) : undefined}

                      className={`
                      group transition-all duration-200 rounded-lg mb-1
                      ${isActive(item.url) && !isLocked
                          ? 'bg-white/20 text-white shadow-glass border border-white/20'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                        }
                        ${isLocked ? 'cursor-pointer' : ''}
                    `}

                    >
                      {isLocked ? (
                        <>
                        <item.icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 transition-colors`} />
                        {!isCollapsed && (
                          <span className="font-medium flex-1">{item.title}</span>
                        )}
                        {/*{!isCollapsed && (
                          <Crown className="h-4 w-4 text-yellow-400" />
                        )}*/}
                        </>
                     ) : (

                      <NavLink to={item.url} end={item.url === '/'}>
                        <item.icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 transition-colors`} />
                        {!isCollapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </NavLink>
                     )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              }
              )}
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
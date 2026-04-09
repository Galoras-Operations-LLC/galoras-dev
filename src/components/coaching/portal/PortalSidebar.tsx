import {
  LayoutDashboard,
  UserCircle,
  Eye,
  Handshake,
  FlaskConical,
  MessageSquare,
  Settings,
  MoreHorizontal,
  HelpCircle,
} from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'My Profile', icon: UserCircle },
  { id: 'visibility', label: 'Visibility & Signals', icon: Eye },
  { id: 'engagement', label: 'Engagement', icon: Handshake },
  { id: 'labs', label: 'Leadership Labs', icon: FlaskConical },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface PortalSidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export function PortalSidebar({ activeTab, onNavigate }: PortalSidebarProps) {
  return (
    <aside className="w-60 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6">
        <span className="text-xl font-display font-bold tracking-tight text-white">
          GALORAS
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.id === activeTab ||
            (item.id === 'engagement' && (activeTab === 'bookings' || activeTab === 'availability' || activeTab === 'products'));
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}

        {/* More */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground/60 hover:text-muted-foreground hover:bg-white/5 transition-colors">
          <MoreHorizontal className="h-4 w-4 shrink-0" />
          More
        </button>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Need help? Contact Admin</span>
        </div>
      </div>
    </aside>
  );
}

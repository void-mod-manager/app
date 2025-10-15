import {
  BugIcon,
  LibraryIcon,
  type LucideIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/styleUtils";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  predicate?: () => boolean;
};

const navItems: NavItem[] = [
  {
    id: "library" as const,
    label: "Library",
    path: "/library",
    icon: LibraryIcon,
  },
  {
    id: "discover" as const,
    label: "Discover",
    path: "/discover",
    icon: SearchIcon,
  },
  {
    id: "settings" as const,
    label: "Settings",
    path: "/settings",
    icon: SettingsIcon,
  },
  {
    id: "debug" as const,
    label: "Debug",
    path: "/debug",
    icon: BugIcon,
    predicate: () => {
      return process.env.NODE_ENV === "development";
    },
  },
];

const Sidebar = () => {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="w-64 border-r border-border/50 bg-sidebar flex flex-col">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <p className="text-primary font-bold">?</p>
          </div>
          <div>
            <h1 className="font-semibold text-sm text-sidebar-foreground">
              Void Mod Manager
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono uppercase">
              Dev {"///"} {process.env.NEXT_PUBLIC_COMMIT_SHA}
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-border/50">
        <p className="text-[10px] h-full align-middle text-center font-medium text-muted-foreground uppercase pb-2 pt-2 tracking-wider">
          Game Providers unavaliable
        </p>
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            if (item.predicate !== undefined && item.predicate() !== true) {
              return null;
            }

            const Icon = item.icon;
            const isSelected = item.path
              ? pathname.startsWith(item.path)
              : false;

            return (
              <li key={item.id}>
                <Link
                  href={item.path}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-2 rounded-md text-sm transition-colors group",
                    isSelected
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-normal">{item.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

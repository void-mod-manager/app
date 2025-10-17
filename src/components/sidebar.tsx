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
    <aside className="flex w-64 flex-col border-border/50 border-r bg-sidebar">
      <div className="border-border/50 border-b p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10">
            <p className="font-bold text-primary">?</p>
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground text-sm">
              Void Mod Manager
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground uppercase">
              Dev {"///"} {process.env.NEXT_PUBLIC_COMMIT_SHA}
            </p>
          </div>
        </div>
      </div>

      <div className="border-border/50 border-b p-3">
        <p className="h-full pt-2 pb-2 text-center align-middle font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
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
                    "group flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors",
                    isSelected
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
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

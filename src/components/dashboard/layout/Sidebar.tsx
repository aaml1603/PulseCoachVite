import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  HelpCircle,
  FolderKanban,
  Dumbbell,
  MessageSquare,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
}

interface SidebarProps {
  items?: NavItem[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
}

const defaultNavItems: NavItem[] = [
  { icon: <Home size={18} />, label: "Home", href: "/" },
  {
    icon: <LayoutDashboard size={18} />,
    label: "Dashboard",
    href: "/dashboard",
    isActive: true,
  },
  { icon: <Users size={18} />, label: "Clients", href: "/clients" },
  { icon: <MessageSquare size={18} />, label: "Messages", href: "/messaging" },
  {
    icon: <Dumbbell size={18} />,
    label: "Workout Builder",
    href: "/workout-builder",
  },
];

const defaultBottomItems: NavItem[] = [
  { icon: <Settings size={18} />, label: "Settings" },
  { icon: <HelpCircle size={18} />, label: "Help" },
];

const Sidebar = ({
  items = defaultNavItems,
  activeItem = "Dashboard",
  onItemClick = () => {},
}: SidebarProps) => {
  return (
    <div className="w-[240px] h-screen sticky top-0 border-r border-border bg-background flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1 flex items-center">
          <Dumbbell className="h-5 w-5 mr-2 text-blue-600" />
          FitCoach Pro
        </h2>
        <p className="text-sm text-muted-foreground">
          Fitness coaching platform
        </p>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {items.map((item) => (
            <Button
              key={item.label}
              variant={item.label === activeItem ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 text-sm h-10"
              onClick={() => {
                onItemClick(item.label);
                if (item.href) {
                  window.location.href = item.href;
                }
              }}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <h3 className="text-xs font-medium px-3 py-2 text-muted-foreground">
            Filters
          </h3>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm h-9"
          >
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            Active
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm h-9"
          >
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            High Priority
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm h-9"
          >
            <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
            In Progress
          </Button>
        </div>
      </ScrollArea>

      <div className="p-3 mt-auto border-t border-border">
        {defaultBottomItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className="w-full justify-start gap-2 text-sm h-10 mb-1"
            onClick={() => onItemClick(item.label)}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

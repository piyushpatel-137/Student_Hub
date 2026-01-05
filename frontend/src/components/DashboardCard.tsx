import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  gradient?: string;
}

export const DashboardCard = ({ title, count, icon: Icon, gradient }: DashboardCardProps) => {
  return (
    <Card className="group relative overflow-hidden border-0 bg-card p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <Icon className="h-8 w-8 text-primary" />
          <span className="text-3xl font-bold text-card-foreground">{count}</span>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Card>
  );
};

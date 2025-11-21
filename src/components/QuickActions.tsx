import { Button } from "@/components/ui/button";
import { Compass, MapPin, Calendar, DollarSign } from "lucide-react";

interface QuickActionsProps {
  onSelect: (query: string) => void;
  disabled: boolean;
}

const QuickActions = ({ onSelect, disabled }: QuickActionsProps) => {
  const actions = [
    {
      icon: MapPin,
      label: "Top Attractions",
      query: "What are the top tourist attractions in Paris?",
    },
    {
      icon: Calendar,
      label: "Plan Itinerary",
      query: "Suggest a 5-day itinerary for Tokyo",
    },
    {
      icon: DollarSign,
      label: "Budget Hotels",
      query: "Find budget-friendly hotels in Barcelona",
    },
    {
      icon: Compass,
      label: "Best Time",
      query: "When is the best time to visit Bali?",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.label}
            variant="outline"
            onClick={() => onSelect(action.query)}
            disabled={disabled}
            className="h-auto py-4 px-3 flex flex-col items-center gap-2 hover:bg-sky hover:border-primary transition-all rounded-xl"
          >
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-center">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default QuickActions;

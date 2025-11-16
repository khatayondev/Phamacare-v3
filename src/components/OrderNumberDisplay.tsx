/**
 * Order Number Display Component
 * Shows order number information with formatted date and type
 */

import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { FileText, ShoppingCart, Calendar } from "lucide-react";
import { parseOrderNumber, formatOrderDate } from "../utils/orderNumberGenerator";

interface OrderNumberDisplayProps {
  orderNumber: string;
  showDate?: boolean;
  showIcon?: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function OrderNumberDisplay({ 
  orderNumber, 
  showDate = false,
  showIcon = true,
  variant = "default",
  size = "md"
}: OrderNumberDisplayProps) {
  const parsed = parseOrderNumber(orderNumber);
  
  if (!parsed.isValid) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {orderNumber}
      </Badge>
    );
  }

  const isPrescription = parsed.type === 'prescription';
  const formattedDate = formatOrderDate(orderNumber);
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const Icon = isPrescription ? FileText : ShoppingCart;
  const iconClass = iconSizeClasses[size];
  
  const badgeContent = (
    <div className="flex items-center gap-1.5">
      {showIcon && <Icon className={iconClass} />}
      <span className="font-mono font-medium">{orderNumber}</span>
    </div>
  );

  const tooltipContent = (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="h-3 w-3" />
        <span className="font-semibold">
          {isPrescription ? "Prescription" : "Walk-in Order"}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>{formattedDate}</span>
      </div>
      {parsed.sequence && (
        <div className="text-xs text-muted-foreground">
          Sequence: #{parsed.sequence}
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={variant}
            className={`${sizeClasses[size]} ${
              isPrescription 
                ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200" 
                : "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200"
            }`}
          >
            {badgeContent}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Compact Order Number Badge (for tables)
 */
export function OrderNumberBadge({ orderNumber }: { orderNumber: string }) {
  const parsed = parseOrderNumber(orderNumber);
  const isPrescription = parsed.type === 'prescription';
  
  return (
    <Badge 
      variant="outline"
      className={`font-mono ${
        isPrescription 
          ? "bg-blue-500/5 text-blue-600 border-blue-200" 
          : "bg-green-500/5 text-green-600 border-green-200"
      }`}
    >
      {orderNumber}
    </Badge>
  );
}

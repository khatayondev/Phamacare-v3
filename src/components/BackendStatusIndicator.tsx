import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Cloud, CloudOff, AlertCircle, Database } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { isBackendAvailable, checkBackendStatus } from "../utils/backendApi";

export function BackendStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Check status every 30 seconds
    const checkStatus = async () => {
      const status = await checkBackendStatus();
      setIsOnline(status);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleManualCheck = async () => {
    setChecking(true);
    const status = await checkBackendStatus();
    setIsOnline(status);
    setChecking(false);
  };

  if (isOnline) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Badge 
              variant="outline" 
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 cursor-pointer"
              onClick={handleManualCheck}
            >
              <Cloud className="h-3 w-3 mr-1" />
              {checking ? "Checking..." : "Online"}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connected to backend database</p>
          <p className="text-xs text-muted-foreground">Click to refresh</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Badge 
            variant="outline" 
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 cursor-pointer"
            onClick={handleManualCheck}
          >
            <Database className="h-3 w-3 mr-1" />
            {checking ? "Checking..." : "Local"}
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-medium mb-1">💾 Local Storage Mode</p>
        <p className="text-xs text-muted-foreground mb-2">
          Running in offline-first mode using browser localStorage. All data is saved locally.
        </p>
        <p className="text-xs font-semibold text-green-600">✅ Everything is working correctly!</p>
        <p className="text-xs text-muted-foreground mt-2">
          Backend sync is optional. Click to check if backend is available.
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "./ui/badge";

export function SyncIndicator() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [timeSince, setTimeSince] = useState<number>(0);

  useEffect(() => {
    const handleSyncStart = () => {
      setIsSyncing(true);
    };

    const handleSyncComplete = () => {
      setIsSyncing(false);
      setLastSync(new Date());
    };

    // Listen for custom sync events
    window.addEventListener('syncStart', handleSyncStart);
    window.addEventListener('syncComplete', handleSyncComplete);
    window.addEventListener('prescriptionsUpdated', handleSyncComplete as EventListener);
    window.addEventListener('medicinesUpdated', handleSyncComplete as EventListener);
    window.addEventListener('patientsUpdated', handleSyncComplete as EventListener);

    return () => {
      window.removeEventListener('syncStart', handleSyncStart);
      window.removeEventListener('syncComplete', handleSyncComplete);
      window.removeEventListener('prescriptionsUpdated', handleSyncComplete as EventListener);
      window.removeEventListener('medicinesUpdated', handleSyncComplete as EventListener);
      window.removeEventListener('patientsUpdated', handleSyncComplete as EventListener);
    };
  }, []);

  // Update time since last sync every second
  useEffect(() => {
    if (!lastSync) {
      setTimeSince(0);
      return;
    }

    const updateTime = () => {
      const seconds = Math.floor((Date.now() - lastSync.getTime()) / 1000);
      setTimeSince(seconds);
    };

    // Update immediately
    updateTime();

    // Then update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [lastSync]);

  if (isSyncing) {
    return (
      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        Syncing...
      </Badge>
    );
  }

  if (lastSync && timeSince < 60) {
    return (
      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
        Synced {timeSince}s ago
      </Badge>
    );
  }

  return null;
}

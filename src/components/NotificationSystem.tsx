import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, Bell, CheckCircle, Clock } from "lucide-react";

interface Notification {
  id: string;
  type: "prescription_created" | "payment_processed";
  message: string;
  timestamp: string;
  read: boolean;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for prescription events
    const handlePrescriptionCreated = (event: CustomEvent) => {
      const prescription = event.detail;
      const notification: Notification = {
        id: crypto.randomUUID(),
        type: "prescription_created",
        message: `New prescription ${prescription.prescription_number} created for ${prescription.patientName}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => setIsVisible(false), 5000);
    };

    window.addEventListener('prescriptionCreated', handlePrescriptionCreated as EventListener);

    return () => {
      window.removeEventListener('prescriptionCreated', handlePrescriptionCreated as EventListener);
    };
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 3).map((notification) => (
        <Card key={notification.id} className="bg-white shadow-lg border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {notification.type === "prescription_created" ? (
                    <Clock className="h-4 w-4 text-blue-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
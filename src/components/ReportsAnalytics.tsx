import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Users, 
  AlertTriangle,
  BarChart3,
  FileText,
  Printer,
  ArrowUpDown,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { addAuditLog } from "../utils/audit";
import { useAuth } from "./AuthProvider";

const mockSalesData = {
  daily: { revenue: 2840.50, orders: 45, avgOrder: 63.12 },
  weekly: { revenue: 15670.25, orders: 234, avgOrder: 66.97 },
  monthly: { revenue: 67890.75, orders: 987, avgOrder: 68.78 }
};

const mockInventoryData = {
  totalItems: 1247,
  lowStock: 12,
  expiringSoon: 8,
  outOfStock: 3,
  totalValue: 145670.25
};

const mockTopSellingMedicines = [
  { name: "Paracetamol 500mg", quantity: 450, revenue: 675.00 },
  { name: "Ibuprofen 400mg", quantity: 320, revenue: 720.00 },
  { name: "Vitamin D3 1000IU", quantity: 280, revenue: 1666.00 },
  { name: "Amoxicillin 250mg", quantity: 150, revenue: 420.00 },
  { name: "Cough Syrup", quantity: 95, revenue: 807.50 }
];

const mockCustomerInsights = {
  totalCustomers: 856,
  newCustomers: 45,
  returningCustomers: 234,
  avgVisitsPerCustomer: 3.2
};

export function ReportsAnalytics() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("monthly");
  const [reportType, setReportType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [activeTab, setActiveTab] = useState("overview");

  // Effect to handle tab switching when report type changes
  useEffect(() => {
    try {
      if (!isTabVisible(activeTab)) {
        // Switch to the first visible tab
        const visibleTabs = ["overview", "sales", "inventory", "customers", "financial"];
        const firstVisibleTab = visibleTabs.find(tab => isTabVisible(tab));
        if (firstVisibleTab) {
          setActiveTab(firstVisibleTab);
        }
      }
    } catch (error) {
      console.error('Error in tab visibility effect:', error);
      setActiveTab("overview"); // fallback to overview
    }
  }, [reportType, activeTab]);

  // Effect to handle date range changes and reset to current month/year for monthly view
  useEffect(() => {
    if (dateRange === "monthly" && (!selectedMonth || !selectedYear)) {
      const now = new Date();
      setSelectedMonth(now.getMonth().toString());
      setSelectedYear(now.getFullYear().toString());
    }
  }, [dateRange, selectedMonth, selectedYear]);

  // Generate dynamic data based on date range
  const getFilteredSalesData = () => {
    try {
      // Use monthly as base for all calculations
      const baseData = mockSalesData.monthly;
      
      // Apply multipliers based on date range for realistic data simulation
      const multipliers: Record<string, number> = {
        daily: 0.033, // ~1/30 of monthly
        weekly: 0.25, // ~1/4 of monthly  
        monthly: 1,
        quarterly: 3.2,
        yearly: 12.5,
        custom: 1.3,
        specific_month: 1 // For month-based filtering
      };
      
      let multiplier = multipliers[dateRange] || 1;
      
      // Adjust multiplier based on month selection for monthly view
      if (dateRange === "monthly" && selectedMonth && selectedYear) {
        const monthIndex = parseInt(selectedMonth);
        const year = parseInt(selectedYear);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        
        // Apply seasonal variations (higher in winter months for pharmacy)
        const seasonalMultipliers = [1.2, 1.1, 1.0, 0.9, 0.8, 0.8, 0.9, 0.9, 1.0, 1.1, 1.2, 1.3];
        const seasonalAdjustment = seasonalMultipliers[monthIndex] || 1;
        
        // Apply year-over-year growth if looking at past years
        const yearAdjustment = year < currentYear ? 0.9 : 1;
        
        multiplier = multiplier * seasonalAdjustment * yearAdjustment;
      }
      
      return {
        revenue: Math.round(baseData.revenue * multiplier),
        orders: Math.round(baseData.orders * multiplier),
        avgOrder: Math.round(baseData.avgOrder * (multiplier * 0.95) * 100) / 100 // slight adjustment for avg
      };
    } catch (error) {
      console.error('Error in getFilteredSalesData:', error);
      return mockSalesData.monthly;
    }
  };

  // Filter inventory data based on report type
  const getFilteredInventoryData = () => {
    try {
      if (reportType === "inventory" || reportType === "all") {
        return mockInventoryData;
      }
      // Return reduced data for other report types
      return {
        ...mockInventoryData,
        totalItems: Math.round(mockInventoryData.totalItems * 0.6),
        totalValue: Math.round(mockInventoryData.totalValue * 0.6)
      };
    } catch (error) {
      console.error('Error in getFilteredInventoryData:', error);
      return mockInventoryData;
    }
  };

  // Filter customer data based on date range
  const getFilteredCustomerData = () => {
    try {
      const multipliers: Record<string, number> = {
        daily: 0.033,
        weekly: 0.25,
        monthly: 1,
        quarterly: 2.8,
        yearly: 12,
        custom: 1.5
      };
      
      let multiplier = multipliers[dateRange] || 1;
      
      // Apply month-specific adjustments for customer data
      if (dateRange === "monthly" && selectedMonth) {
        const monthIndex = parseInt(selectedMonth);
        // Customer patterns (higher activity in cold months for pharmacy)
        const monthlyPatterns = [1.1, 1.2, 1.0, 0.9, 0.8, 0.7, 0.8, 0.8, 0.9, 1.0, 1.1, 1.2];
        const monthAdjustment = monthlyPatterns[monthIndex] || 1;
        multiplier *= monthAdjustment;
      }
      
      return {
        totalCustomers: Math.round(mockCustomerInsights.totalCustomers * multiplier),
        newCustomers: Math.round(mockCustomerInsights.newCustomers * multiplier),
        returningCustomers: Math.round(mockCustomerInsights.returningCustomers * multiplier),
        avgVisitsPerCustomer: Math.round(mockCustomerInsights.avgVisitsPerCustomer * 100) / 100
      };
    } catch (error) {
      console.error('Error in getFilteredCustomerData:', error);
      return mockCustomerInsights;
    }
  };

  // Get filtered medicines based on date range
  const getFilteredTopMedicines = () => {
    try {
      const multipliers: Record<string, number> = {
        daily: 0.033,
        weekly: 0.25,
        monthly: 1,
        quarterly: 3.2,
        yearly: 12,
        custom: 1.3
      };
      
      let multiplier = multipliers[dateRange] || 1;
      
      // Apply month-specific medicine demand patterns
      if (dateRange === "monthly" && selectedMonth) {
        const monthIndex = parseInt(selectedMonth);
        // Medicine demand patterns (cold/flu season, etc.)
        const medDemandPatterns = [1.3, 1.4, 1.1, 0.9, 0.8, 0.7, 0.8, 0.8, 0.9, 1.0, 1.2, 1.3];
        const demandAdjustment = medDemandPatterns[monthIndex] || 1;
        multiplier *= demandAdjustment;
      }
      
      return mockTopSellingMedicines.map(med => ({
        ...med,
        quantity: Math.round(med.quantity * multiplier),
        revenue: Math.round(med.revenue * multiplier * 100) / 100
      }));
    } catch (error) {
      console.error('Error in getFilteredTopMedicines:', error);
      return mockTopSellingMedicines;
    }
  };

  // Check if tab should be visible based on report type
  const isTabVisible = (tabName: string) => {
    if (reportType === "all") return true;
    if (reportType === "sales" && (tabName === "overview" || tabName === "sales" || tabName === "financial")) return true;
    if (reportType === "inventory" && (tabName === "overview" || tabName === "inventory")) return true;
    if (reportType === "customers" && (tabName === "overview" || tabName === "customers")) return true;
    return false;
  };

  // Get month name for display
  const getMonthName = (monthIndex: string) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[parseInt(monthIndex)] || "Invalid Month";
  };

  // Get formatted date range display text
  const getDateRangeDisplay = () => {
    switch (dateRange) {
      case "daily":
        return "Today";
      case "weekly":
        return "This Week";
      case "monthly":
        return `${getMonthName(selectedMonth)} ${selectedYear}`;
      case "quarterly":
        return "This Quarter";
      case "yearly":
        return `Year ${selectedYear}`;
      case "custom":
        return startDate && endDate ? `${startDate} to ${endDate}` : "Custom Range";
      default:
        return "This Month";
    }
  };

  const handleDownloadReport = (reportName: string, format: 'pdf' | 'csv') => {
    // Add audit log for report generation
    addAuditLog(
      'Report Generated',
      `Generated ${reportName} report in ${format.toUpperCase()} format - Date Range: ${getDateRangeDisplay()}`,
      user?.name,
      'Reports'
    );

    // Get the appropriate data based on report name
    let reportData: any[] = [];
    let title = reportName;
    
    switch (reportName.toLowerCase()) {
      case 'daily sales':
        reportData = [{
          metric: 'Revenue',
          value: mockSalesData.daily.revenue,
          orders: mockSalesData.daily.orders,
          avgOrder: mockSalesData.daily.avgOrder
        }];
        break;
      case 'weekly sales':
        reportData = [{
          metric: 'Revenue',
          value: mockSalesData.weekly.revenue,
          orders: mockSalesData.weekly.orders,
          avgOrder: mockSalesData.weekly.avgOrder
        }];
        break;
      case 'monthly sales':
        reportData = [{
          metric: 'Revenue',
          value: mockSalesData.monthly.revenue,
          orders: mockSalesData.monthly.orders,
          avgOrder: mockSalesData.monthly.avgOrder
        }];
        break;
      case 'inventory status':
        reportData = [{
          metric: 'Total Items',
          value: mockInventoryData.totalItems
        }, {
          metric: 'Low Stock',
          value: mockInventoryData.lowStock
        }, {
          metric: 'Expiring Soon',
          value: mockInventoryData.expiringSoon
        }, {
          metric: 'Out of Stock',
          value: mockInventoryData.outOfStock
        }, {
          metric: 'Total Value',
          value: mockInventoryData.totalValue
        }];
        break;
      case 'inventory turnover':
        reportData = [{
          category: 'Fast Moving',
          items: 156
        }, {
          category: 'Medium Moving',
          items: 342
        }, {
          category: 'Slow Moving',
          items: 89
        }, {
          category: 'Non-Moving',
          items: 23
        }];
        break;
      case 'customer analytics':
        reportData = [{
          metric: 'Total Customers',
          value: mockCustomerInsights.totalCustomers
        }, {
          metric: 'New Customers',
          value: mockCustomerInsights.newCustomers
        }, {
          metric: 'Returning Customers',
          value: mockCustomerInsights.returningCustomers
        }, {
          metric: 'Avg Visits/Customer',
          value: mockCustomerInsights.avgVisitsPerCustomer
        }];
        break;
      case 'complete analytics':
        reportData = [
          ...mockTopSellingMedicines.map(med => ({
            type: 'Top Selling Medicine',
            name: med.name,
            quantity: med.quantity,
            revenue: med.revenue
          })),
          {
            type: 'Sales Summary',
            daily_revenue: mockSalesData.daily.revenue,
            weekly_revenue: mockSalesData.weekly.revenue,
            monthly_revenue: mockSalesData.monthly.revenue
          },
          {
            type: 'Inventory Summary',
            total_items: mockInventoryData.totalItems,
            low_stock: mockInventoryData.lowStock,
            total_value: mockInventoryData.totalValue
          }
        ];
        break;
      default:
        reportData = mockTopSellingMedicines;
    }

    // Use the export utility
    import('../utils/exportUtils').then(({ exportData }) => {
      exportData(reportData, {
        format,
        filename: `${reportName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        title: `${title} Report`,
        subtitle: `Generated on ${new Date().toLocaleDateString()} | Date Range: ${getDateRangeDisplay()}`
      });
    }).catch(error => {
      console.error('Error importing export utilities:', error);
      alert('Error generating report. Please try again.');
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Options */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Reports & Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generate comprehensive reports and analytics for your pharmacy
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => handleDownloadReport("Complete Analytics", "pdf")}>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Today</SelectItem>
                    <SelectItem value="weekly">This Week</SelectItem>
                    <SelectItem value="monthly">This Month</SelectItem>
                    <SelectItem value="quarterly">This Quarter</SelectItem>
                    <SelectItem value="yearly">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="sales">Sales Only</SelectItem>
                    <SelectItem value="inventory">Inventory Only</SelectItem>
                    <SelectItem value="customers">Customers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Month and Year Selection for Monthly Reports */}
            {dateRange === "monthly" && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="selectedMonth">Select Month</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">January</SelectItem>
                      <SelectItem value="1">February</SelectItem>
                      <SelectItem value="2">March</SelectItem>
                      <SelectItem value="3">April</SelectItem>
                      <SelectItem value="4">May</SelectItem>
                      <SelectItem value="5">June</SelectItem>
                      <SelectItem value="6">July</SelectItem>
                      <SelectItem value="7">August</SelectItem>
                      <SelectItem value="8">September</SelectItem>
                      <SelectItem value="9">October</SelectItem>
                      <SelectItem value="10">November</SelectItem>
                      <SelectItem value="11">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="selectedYear">Select Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Custom Date Range */}
            {dateRange === "custom" && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${["overview", "sales", "inventory", "customers", "financial"].filter(tab => isTabVisible(tab)).length}, 1fr)` }}>
          {isTabVisible("overview") && <TabsTrigger value="overview">Overview</TabsTrigger>}
          {isTabVisible("sales") && <TabsTrigger value="sales">Sales</TabsTrigger>}
          {isTabVisible("inventory") && <TabsTrigger value="inventory">Inventory</TabsTrigger>}
          {isTabVisible("customers") && <TabsTrigger value="customers">Customers</TabsTrigger>}
          {isTabVisible("financial") && <TabsTrigger value="financial">Financial</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        {isTabVisible("overview") && (
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₵{getFilteredSalesData().revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5% from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getFilteredSalesData().orders}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg: ₵{getFilteredSalesData().avgOrder.toFixed(2)} per order
                  </p>
                </CardContent>
              </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-muted-foreground">Active Customers</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getFilteredCustomerData().totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  +{getFilteredCustomerData().newCustomers} new this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-muted-foreground">Inventory Value</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₵{getFilteredInventoryData().totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {getFilteredInventoryData().totalItems} total items
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Medicines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredTopMedicines().map((medicine, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {medicine.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₵{medicine.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  Inventory Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">Low Stock Items</p>
                      <p className="text-sm text-muted-foreground">Items below minimum threshold</p>
                    </div>
                    <Badge variant="destructive">{mockInventoryData.lowStock}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">Expiring Soon</p>
                      <p className="text-sm text-muted-foreground">Items expiring within 30 days</p>
                    </div>
                    <Badge variant="secondary">{mockInventoryData.expiringSoon}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Out of Stock</p>
                      <p className="text-sm text-muted-foreground">Items with zero inventory</p>
                    </div>
                    <Badge variant="outline">{mockInventoryData.outOfStock}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </TabsContent>
        )}

        {/* Sales Reports Tab */}
        {isTabVisible("sales") && (
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{getDateRangeDisplay()} Sales Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium">₵{getFilteredSalesData().revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orders:</span>
                    <span className="font-medium">{getFilteredSalesData().orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Order:</span>
                    <span className="font-medium">₵{getFilteredSalesData().avgOrder.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport(`${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)} Sales`, "pdf")}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport(`${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)} Sales`, "csv")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {getFilteredTopMedicines().slice(0, 3).map((medicine, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{medicine.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {medicine.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">₵{medicine.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport("Top Products", "pdf")}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport("Top Products", "csv")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sales Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">₵{getFilteredSalesData().revenue.toLocaleString()}</div>
                    <div className="text-sm text-green-600">Total Revenue</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-700">{getFilteredSalesData().orders}</div>
                    <div className="text-sm text-blue-600">Total Orders</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-700">₵{getFilteredSalesData().avgOrder.toFixed(2)}</div>
                    <div className="text-sm text-purple-600">Avg Order Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">45%</div>
                  <div className="text-sm text-muted-foreground">Card Payments</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">30%</div>
                  <div className="text-sm text-muted-foreground">Cash Payments</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">25%</div>
                  <div className="text-sm text-muted-foreground">Insurance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Inventory Reports Tab */}
        {isTabVisible("inventory") && (
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span className="font-medium">{getFilteredInventoryData().totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-medium">₵{getFilteredInventoryData().totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Low Stock:</span>
                    <span className="font-medium">{getFilteredInventoryData().lowStock}</span>
                  </div>
                  <div className="flex justify-between text-yellow-600">
                    <span>Expiring Soon:</span>
                    <span className="font-medium">{getFilteredInventoryData().expiringSoon}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Out of Stock:</span>
                    <span className="font-medium">{getFilteredInventoryData().outOfStock}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport("Inventory Status", "pdf")}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport("Inventory Status", "csv")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Turnover Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Fast Moving:</span>
                    <span className="font-medium">156 items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium Moving:</span>
                    <span className="font-medium">342 items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slow Moving:</span>
                    <span className="font-medium">89 items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Non-Moving:</span>
                    <span className="font-medium">23 items</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport("Inventory Turnover", "pdf")}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport("Inventory Turnover", "csv")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expiry Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-sm text-muted-foreground">Expired</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">8</div>
                  <div className="text-sm text-muted-foreground">Expiring This Week</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">15</div>
                  <div className="text-sm text-muted-foreground">Expiring This Month</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">34</div>
                  <div className="text-sm text-muted-foreground">Expiring Next Month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Customer Reports Tab */}
        {isTabVisible("customers") && (
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Customers:</span>
                    <span className="font-medium">{getFilteredCustomerData().totalCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Customers:</span>
                    <span className="font-medium">{getFilteredCustomerData().newCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Returning Customers:</span>
                    <span className="font-medium">{getFilteredCustomerData().returningCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Visits/Customer:</span>
                    <span className="font-medium">{getFilteredCustomerData().avgVisitsPerCustomer}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport("Customer Analytics", "pdf")}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport("Customer Analytics", "csv")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prescription Refill Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Due This Week:</span>
                    <span className="font-medium">67</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due This Month:</span>
                    <span className="font-medium">234</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overdue:</span>
                    <span className="font-medium text-red-600">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refill Rate:</span>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport("Prescription Refills", "pdf")}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownloadReport("Prescription Refills", "csv")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        )}

        {/* Financial Reports Tab */}
        {isTabVisible("financial") && (
        <TabsContent value="financial" className="space-y-6">
          <FinancialReportsTab 
            dateRange={dateRange}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onDownloadReport={handleDownloadReport}
          />
        </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// Financial Reports Tab Component with Sorting
interface FinancialReportsTabProps {
  dateRange: string;
  selectedMonth: string;
  selectedYear: string;
  onDownloadReport: (reportName: string, format: 'pdf' | 'csv') => void;
}

function FinancialReportsTab({ dateRange, selectedMonth, selectedYear, onDownloadReport }: FinancialReportsTabProps) {
  const [transactionSort, setTransactionSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'date', direction: 'desc' });
  const [expenseSort, setExpenseSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'date', direction: 'desc' });
  const [paymentSort, setPaymentSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'date', direction: 'desc' });
  
  // Mock financial transaction data
  const mockTransactions = [
    { id: 'TXN001', date: '2024-10-07', type: 'Sale', amount: 450.00, customer: 'John Doe', method: 'Cash', status: 'Completed' },
    { id: 'TXN002', date: '2024-10-07', type: 'Sale', amount: 275.50, customer: 'Jane Smith', method: 'Card', status: 'Completed' },
    { id: 'TXN003', date: '2024-10-06', type: 'Sale', amount: 625.00, customer: 'Mike Johnson', method: 'Insurance', status: 'Pending' },
    { id: 'TXN004', date: '2024-10-06', type: 'Refund', amount: -125.00, customer: 'Sarah Wilson', method: 'Cash', status: 'Completed' },
    { id: 'TXN005', date: '2024-10-05', type: 'Sale', amount: 890.75, customer: 'David Brown', method: 'Card', status: 'Completed' },
    { id: 'TXN006', date: '2024-10-05', type: 'Sale', amount: 320.25, customer: 'Lisa Davis', method: 'Cash', status: 'Completed' },
    { id: 'TXN007', date: '2024-10-04', type: 'Sale', amount: 555.00, customer: 'Tom Miller', method: 'Insurance', status: 'Completed' },
    { id: 'TXN008', date: '2024-10-04', type: 'Sale', amount: 180.50, customer: 'Anna Garcia', method: 'Card', status: 'Completed' },
    { id: 'TXN009', date: '2024-10-03', type: 'Sale', amount: 750.00, customer: 'Chris Lee', method: 'Cash', status: 'Completed' },
    { id: 'TXN010', date: '2024-10-03', type: 'Refund', amount: -95.25, customer: 'Emma Taylor', method: 'Card', status: 'Completed' }
  ];

  const mockExpenses = [
    { id: 'EXP001', date: '2024-10-07', category: 'Inventory Purchase', description: 'Medical supplies restock', amount: 2450.00, vendor: 'PharmaCorp Ltd' },
    { id: 'EXP002', date: '2024-10-06', category: 'Utilities', description: 'Electricity bill', amount: 340.50, vendor: 'Power Company' },
    { id: 'EXP003', date: '2024-10-05', category: 'Staff Salary', description: 'Monthly salaries', amount: 8500.00, vendor: 'Payroll' },
    { id: 'EXP004', date: '2024-10-04', category: 'Marketing', description: 'Online advertising', amount: 250.00, vendor: 'Ad Agency' },
    { id: 'EXP005', date: '2024-10-03', category: 'Inventory Purchase', description: 'Pharmaceutical supplies', amount: 3200.75, vendor: 'MedSupply Co' },
    { id: 'EXP006', date: '2024-10-02', category: 'Equipment', description: 'Printer maintenance', amount: 150.00, vendor: 'Tech Solutions' },
    { id: 'EXP007', date: '2024-10-01', category: 'Rent', description: 'Monthly rent payment', amount: 2800.00, vendor: 'Property Manager' },
    { id: 'EXP008', date: '2024-09-30', category: 'Insurance', description: 'Business insurance premium', amount: 650.00, vendor: 'Insurance Co' }
  ];

  const mockPayments = [
    { id: 'PAY001', date: '2024-10-07', customer: 'John Doe', invoice: 'INV-2024-001', amount: 450.00, method: 'Cash', status: 'Paid' },
    { id: 'PAY002', date: '2024-10-07', customer: 'Jane Smith', invoice: 'INV-2024-002', amount: 275.50, method: 'Card', status: 'Paid' },
    { id: 'PAY003', date: '2024-10-06', customer: 'Mike Johnson', invoice: 'INV-2024-003', amount: 625.00, method: 'Insurance', status: 'Pending' },
    { id: 'PAY004', date: '2024-10-05', customer: 'David Brown', invoice: 'INV-2024-004', amount: 890.75, method: 'Card', status: 'Paid' },
    { id: 'PAY005', date: '2024-10-05', customer: 'Lisa Davis', invoice: 'INV-2024-005', amount: 320.25, method: 'Cash', status: 'Paid' },
    { id: 'PAY006', date: '2024-10-04', customer: 'Tom Miller', invoice: 'INV-2024-006', amount: 555.00, method: 'Insurance', status: 'Paid' },
    { id: 'PAY007', date: '2024-10-03', customer: 'Chris Lee', invoice: 'INV-2024-007', amount: 750.00, method: 'Cash', status: 'Paid' },
    { id: 'PAY008', date: '2024-10-02', customer: 'Mary White', invoice: 'INV-2024-008', amount: 420.50, method: 'Card', status: 'Overdue' }
  ];

  // Sorting functions
  const sortData = (data: any[], sortConfig: { field: string; direction: 'asc' | 'desc' }) => {
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (sortConfig.field === 'amount') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (sortConfig.field === 'date') {
        return sortConfig.direction === 'asc' 
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      }
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  };

  const handleSort = (field: string, sortConfig: { field: string; direction: 'asc' | 'desc' }, setSortConfig: any) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction });
  };

  const SortButton = ({ field, sortConfig, onClick }: { field: string; sortConfig: { field: string; direction: 'asc' | 'desc' }; onClick: () => void }) => (
    <Button variant="ghost" size="sm" onClick={onClick} className="h-8 p-0 font-medium">
      {sortConfig.field === field ? (
        sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      ) : (
        <ArrowUpDown className="h-4 w-4" />
      )}
    </Button>
  );

  const sortedTransactions = sortData(mockTransactions, transactionSort);
  const sortedExpenses = sortData(mockExpenses, expenseSort);
  const sortedPayments = sortData(mockPayments, paymentSort);

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profit & Loss</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Revenue:</span>
                <span className="font-medium">₵67,890</span>
              </div>
              <div className="flex justify-between">
                <span>COGS:</span>
                <span className="font-medium">₵42,150</span>
              </div>
              <div className="flex justify-between">
                <span>Expenses:</span>
                <span className="font-medium">₵12,340</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Net Profit:</span>
                <span className="text-green-600">₵13,400</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onDownloadReport("Profit Loss", "pdf")}
              >
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onDownloadReport("Profit Loss", "csv")}
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sales Tax:</span>
                <span className="font-medium">₵5,431</span>
              </div>
              <div className="flex justify-between">
                <span>Prescription Tax:</span>
                <span className="font-medium">₵1,245</span>
              </div>
              <div className="flex justify-between">
                <span>Other Taxes:</span>
                <span className="font-medium">₵892</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Total Tax:</span>
                <span>₵7,568</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onDownloadReport("Tax Summary", "pdf")}
              >
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onDownloadReport("Tax Summary", "csv")}
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cash Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Cash In:</span>
                <span className="font-medium text-green-600">₵67,890</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Out:</span>
                <span className="font-medium text-red-600">₵54,490</span>
              </div>
              <div className="flex justify-between">
                <span>Accounts Receivable:</span>
                <span className="font-medium">₵8,340</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Net Cash Flow:</span>
                <span className="text-green-600">₵13,400</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onDownloadReport("Cash Flow", "pdf")}
              >
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onDownloadReport("Cash Flow", "csv")}
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Financial Tables with Sorting */}
      <div className="grid grid-cols-1 gap-6">
        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDownloadReport("Transactions", "csv")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Transaction ID
                        <SortButton 
                          field="id" 
                          sortConfig={transactionSort} 
                          onClick={() => handleSort('id', transactionSort, setTransactionSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Date
                        <SortButton 
                          field="date" 
                          sortConfig={transactionSort} 
                          onClick={() => handleSort('date', transactionSort, setTransactionSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Type
                        <SortButton 
                          field="type" 
                          sortConfig={transactionSort} 
                          onClick={() => handleSort('type', transactionSort, setTransactionSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Customer
                        <SortButton 
                          field="customer" 
                          sortConfig={transactionSort} 
                          onClick={() => handleSort('customer', transactionSort, setTransactionSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-right p-2">
                      <div className="flex items-center gap-1 justify-end">
                        Amount
                        <SortButton 
                          field="amount" 
                          sortConfig={transactionSort} 
                          onClick={() => handleSort('amount', transactionSort, setTransactionSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Method
                        <SortButton 
                          field="method" 
                          sortConfig={transactionSort} 
                          onClick={() => handleSort('method', transactionSort, setTransactionSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Status
                        <SortButton 
                          field="status" 
                          sortConfig={transactionSort} 
                          onClick={() => handleSort('status', transactionSort, setTransactionSort)} 
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{transaction.id}</td>
                      <td className="p-2">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="p-2">
                        <Badge variant={transaction.type === 'Sale' ? 'default' : 'secondary'}>
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="p-2">{transaction.customer}</td>
                      <td className={`p-2 text-right font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₵{Math.abs(transaction.amount).toFixed(2)}
                      </td>
                      <td className="p-2">{transaction.method}</td>
                      <td className="p-2">
                        <Badge variant={
                          transaction.status === 'Completed' ? 'default' : 
                          transaction.status === 'Pending' ? 'secondary' : 'outline'
                        }>
                          {transaction.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Expenses</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDownloadReport("Expenses", "csv")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Expense ID
                        <SortButton 
                          field="id" 
                          sortConfig={expenseSort} 
                          onClick={() => handleSort('id', expenseSort, setExpenseSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Date
                        <SortButton 
                          field="date" 
                          sortConfig={expenseSort} 
                          onClick={() => handleSort('date', expenseSort, setExpenseSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Category
                        <SortButton 
                          field="category" 
                          sortConfig={expenseSort} 
                          onClick={() => handleSort('category', expenseSort, setExpenseSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-right p-2">
                      <div className="flex items-center gap-1 justify-end">
                        Amount
                        <SortButton 
                          field="amount" 
                          sortConfig={expenseSort} 
                          onClick={() => handleSort('amount', expenseSort, setExpenseSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Vendor
                        <SortButton 
                          field="vendor" 
                          sortConfig={expenseSort} 
                          onClick={() => handleSort('vendor', expenseSort, setExpenseSort)} 
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{expense.id}</td>
                      <td className="p-2">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="p-2">
                        <Badge variant="outline">{expense.category}</Badge>
                      </td>
                      <td className="p-2">{expense.description}</td>
                      <td className="p-2 text-right font-medium text-red-600">₵{expense.amount.toFixed(2)}</td>
                      <td className="p-2">{expense.vendor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Records</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDownloadReport("Payments", "csv")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Payment ID
                        <SortButton 
                          field="id" 
                          sortConfig={paymentSort} 
                          onClick={() => handleSort('id', paymentSort, setPaymentSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Date
                        <SortButton 
                          field="date" 
                          sortConfig={paymentSort} 
                          onClick={() => handleSort('date', paymentSort, setPaymentSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Customer
                        <SortButton 
                          field="customer" 
                          sortConfig={paymentSort} 
                          onClick={() => handleSort('customer', paymentSort, setPaymentSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Invoice
                        <SortButton 
                          field="invoice" 
                          sortConfig={paymentSort} 
                          onClick={() => handleSort('invoice', paymentSort, setPaymentSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-right p-2">
                      <div className="flex items-center gap-1 justify-end">
                        Amount
                        <SortButton 
                          field="amount" 
                          sortConfig={paymentSort} 
                          onClick={() => handleSort('amount', paymentSort, setPaymentSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Method
                        <SortButton 
                          field="method" 
                          sortConfig={paymentSort} 
                          onClick={() => handleSort('method', paymentSort, setPaymentSort)} 
                        />
                      </div>
                    </th>
                    <th className="text-left p-2">
                      <div className="flex items-center gap-1">
                        Status
                        <SortButton 
                          field="status" 
                          sortConfig={paymentSort} 
                          onClick={() => handleSort('status', paymentSort, setPaymentSort)} 
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{payment.id}</td>
                      <td className="p-2">{new Date(payment.date).toLocaleDateString()}</td>
                      <td className="p-2">{payment.customer}</td>
                      <td className="p-2 font-mono text-sm">{payment.invoice}</td>
                      <td className="p-2 text-right font-medium text-green-600">₵{payment.amount.toFixed(2)}</td>
                      <td className="p-2">{payment.method}</td>
                      <td className="p-2">
                        <Badge variant={
                          payment.status === 'Paid' ? 'default' : 
                          payment.status === 'Pending' ? 'secondary' : 'destructive'
                        }>
                          {payment.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
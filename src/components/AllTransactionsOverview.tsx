import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  Filter,
  Download,
  Eye,
  Search,
  BarChart3
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Transaction {
  id: string;
  type: 'prescription' | 'walk-in' | 'payment';
  prescription_number: string;
  customerName: string;
  customerPhone: string;
  pharmacistName?: string;
  accountantName?: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Dispensed';
  date: string;
  items: number;
}

export function AllTransactionsOverview() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7");

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, typeFilter, dateRange]);

  const loadTransactions = () => {
    // Load prescriptions data and convert to transactions
    const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    
    const allTransactions: Transaction[] = [
      // Convert prescriptions to transactions
      ...prescriptions.map((prescription: any) => ({
        id: prescription.id,
        type: prescription.isWalkIn ? 'walk-in' : 'prescription',
        prescription_number: prescription.prescription_number,
        customerName: prescription.patientName,
        customerPhone: prescription.patientPhone,
        pharmacistName: prescription.pharmacistName,
        amount: prescription.total,
        status: prescription.status,
        date: prescription.created_at,
        items: prescription.items?.length || 0
      })),
      // Add payment records
      ...payments.map((payment: any) => ({
        id: payment.id,
        type: 'payment',
        prescription_number: payment.prescription_number,
        customerName: payment.customerName,
        customerPhone: payment.customerPhone,
        accountantName: payment.accountantName,
        amount: payment.amount,
        status: 'Paid',
        date: payment.created_at,
        items: 0
      }))
    ];

    // Sort by date (newest first)
    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setTransactions(allTransactions);
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.prescription_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerPhone.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Filter by date range
    if (dateRange !== "all") {
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
    }

    setFilteredTransactions(filtered);
  };

  const getRevenueStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const todayRevenue = transactions
      .filter(t => t.date.startsWith(today) && (t.status === 'Paid' || t.status === 'Dispensed'))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const weekRevenue = transactions
      .filter(t => new Date(t.date) >= thisWeek && (t.status === 'Paid' || t.status === 'Dispensed'))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalRevenue = transactions
      .filter(t => t.status === 'Paid' || t.status === 'Dispensed')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingRevenue = transactions
      .filter(t => t.status === 'Pending')
      .reduce((sum, t) => sum + t.amount, 0);

    return { todayRevenue, weekRevenue, totalRevenue, pendingRevenue };
  };

  const getChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => 
        t.date.startsWith(dateStr) && (t.status === 'Paid' || t.status === 'Dispensed')
      );
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
        transactions: dayTransactions.length
      });
    }
    return last7Days;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="destructive">Pending</Badge>;
      case 'Paid':
        return <Badge className="bg-blue-100 text-blue-800">Paid</Badge>;
      case 'Dispensed':
        return <Badge className="bg-green-100 text-green-800">Dispensed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'prescription':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Prescription</Badge>;
      case 'walk-in':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Walk-in Sale</Badge>;
      case 'payment':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Payment</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const stats = getRevenueStats();
  const chartData = getChartData();

  if (user?.role !== 'Admin') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <ShoppingCart className="h-12 w-12 mx-auto" />
          </div>
          <h3>Access Denied</h3>
          <p className="text-muted-foreground">Only administrators can view all transactions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Transactions Overview</h2>
          <p className="text-muted-foreground">Complete view of all pharmacy transactions and revenue</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 inline" />
              Today's earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.weekRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              7-day revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All-time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Payments</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.pendingRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            7-Day Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `₵${value.toFixed(2)}` : value,
                  name === 'revenue' ? 'Revenue' : 'Transactions'
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={3}
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Transactions"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, phone, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Dispensed">Dispensed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="walk-in">Walk-in Sale</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1">Today</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                        <p className="text-muted-foreground">No transactions found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.prescription_number}</TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.customerName}</p>
                          <p className="text-sm text-muted-foreground">{transaction.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {transaction.pharmacistName && (
                            <p><span className="text-muted-foreground">Pharmacist:</span> {transaction.pharmacistName}</p>
                          )}
                          {transaction.accountantName && (
                            <p><span className="text-muted-foreground">Accountant:</span> {transaction.accountantName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>₵{transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Search, Plus, Eye, Users, Phone, Mail, Calendar, Loader2 } from "lucide-react";
import { patientAPI } from "../utils/backendApi";
import { addAuditLog } from "../utils/audit";
import { useAuth } from "./AuthProvider";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
  medicalHistory?: string;
  allergies?: string;
  lastVisit?: string;
}

export function PatientManagement() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    emergencyContact: "",
    medicalHistory: "",
    allergies: ""
  });

  useEffect(() => {
    fetchPatients();

    // Listen for patient updates from other components
    const handlePatientsUpdated = (event: CustomEvent) => {
      setPatients(event.detail);
    };

    window.addEventListener('patientsUpdated', handlePatientsUpdated as EventListener);
    return () => {
      window.removeEventListener('patientsUpdated', handlePatientsUpdated as EventListener);
    };
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async () => {
    try {
      setIsSubmitting(true);
      await patientAPI.create(newPatient);
      await fetchPatients();
      
      // Add audit log
      addAuditLog(
        'Patient Added',
        `Added new patient: ${newPatient.name} (${newPatient.phone}) - DOB: ${newPatient.dateOfBirth}`,
        user?.name,
        'Patient'
      );
      
      setIsAddDialogOpen(false);
      setNewPatient({
        name: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        emergencyContact: "",
        medicalHistory: "",
        allergies: ""
      });
    } catch (error) {
      console.error('Error adding patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading patients...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">Active patient records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">New Patients</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => {
                const lastVisit = new Date(p.lastVisit || '');
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return lastVisit >= thirtyDaysAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">Recent Visits</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => {
                if (!p.lastVisit) return false;
                const lastVisit = new Date(p.lastVisit);
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return lastVisit >= sevenDaysAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">With Allergies</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.allergies && p.allergies !== "None known").length}
            </div>
            <p className="text-xs text-muted-foreground">Require special attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Patient Management</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                  <DialogDescription>
                    Enter patient information to create a new patient record. Fields marked with * are required.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patientName">Full Name *</Label>
                    <Input 
                      id="patientName" 
                      placeholder="Enter patient's full name"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientEmail">Email (Optional)</Label>
                      <Input 
                        id="patientEmail" 
                        type="email"
                        placeholder="patient@email.com"
                        value={newPatient.email}
                        onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientPhone">Phone *</Label>
                      <Input 
                        id="patientPhone" 
                        placeholder="+1 (555) 000-0000"
                        value={newPatient.phone}
                        onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="patientAddress">Address (Optional)</Label>
                    <Textarea 
                      id="patientAddress" 
                      placeholder="Full address"
                      value={newPatient.address}
                      onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                    <Input 
                      id="dateOfBirth" 
                      type="date"
                      value={newPatient.dateOfBirth}
                      onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact (Optional)</Label>
                    <Input 
                      id="emergencyContact" 
                      placeholder="Name - Phone Number"
                      value={newPatient.emergencyContact}
                      onChange={(e) => setNewPatient({...newPatient, emergencyContact: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="medicalHistory">Medical History (Optional)</Label>
                    <Textarea 
                      id="medicalHistory" 
                      placeholder="Previous medical conditions, treatments, etc."
                      value={newPatient.medicalHistory}
                      onChange={(e) => setNewPatient({...newPatient, medicalHistory: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="allergies">Allergies (Optional)</Label>
                    <Textarea 
                      id="allergies" 
                      placeholder="Known allergies (or 'None known')"
                      value={newPatient.allergies}
                      onChange={(e) => setNewPatient({...newPatient, allergies: e.target.value})}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleAddPatient}
                    disabled={isSubmitting || !newPatient.name || !newPatient.email || !newPatient.phone}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding Patient...
                      </>
                    ) : (
                      "Add Patient"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Allergies</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {patient.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{calculateAge(patient.dateOfBirth)} years</TableCell>
                    <TableCell>
                      {patient.lastVisit 
                        ? new Date(patient.lastVisit).toLocaleDateString()
                        : "No visits"
                      }
                    </TableCell>
                    <TableCell>
                      {patient.allergies && patient.allergies !== "None known" ? (
                        <Badge variant="destructive">Has Allergies</Badge>
                      ) : (
                        <Badge variant="secondary">None Known</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Patient Details - {selectedPatient?.name}</DialogTitle>
                            <DialogDescription>
                              View comprehensive patient information and medical history.
                            </DialogDescription>
                          </DialogHeader>
                          {selectedPatient && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium mb-2">Personal Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Name:</strong> {selectedPatient.name}</p>
                                    <p><strong>Age:</strong> {calculateAge(selectedPatient.dateOfBirth)} years</p>
                                    <p><strong>Date of Birth:</strong> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                                    <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                                    <p><strong>Email:</strong> {selectedPatient.email}</p>
                                    <p><strong>Address:</strong> {selectedPatient.address}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Emergency Contact</h4>
                                  <p className="text-sm">{selectedPatient.emergencyContact}</p>
                                  
                                  <h4 className="font-medium mb-2 mt-4">Visit Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Last Visit:</strong> {
                                      selectedPatient.lastVisit 
                                        ? new Date(selectedPatient.lastVisit).toLocaleDateString()
                                        : "No previous visits"
                                    }</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Medical History</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedPatient.medicalHistory || "No medical history recorded"}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Allergies</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedPatient.allergies || "No allergies recorded"}
                                </p>
                                {selectedPatient.allergies && selectedPatient.allergies !== "None known" && (
                                  <Badge variant="destructive" className="mt-2">Allergy Alert</Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No patients found matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
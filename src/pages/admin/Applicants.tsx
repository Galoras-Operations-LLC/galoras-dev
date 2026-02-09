import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Loader2, ShieldAlert, ShieldX, Copy, Link } from "lucide-react";
import { format } from "date-fns";

interface CoachApplication {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  bio: string | null;
  experience_years: number | null;
  specialties: string[] | null;
  onboarding_token: string | null;
  onboarding_status: string | null;
}

export default function Applicants() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<CoachApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessState, setAccessState] = useState<"loading" | "denied" | "granted">("loading");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setAccessState("denied");
      setIsLoading(false);
      return;
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      setAccessState("denied");
      setIsLoading(false);
      return;
    }

    setAccessState("granted");
    fetchApplications();
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("coach_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching applications",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setApplications(data || []);
    }
    setIsLoading(false);
  };

  const generateToken = () => {
    return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  };

  const updateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    setUpdatingId(id);
    
    const updateData: Record<string, unknown> = {
      status: newStatus,
      reviewed_at: new Date().toISOString()
    };

    // If approving, generate onboarding token
    if (newStatus === "approved") {
      updateData.onboarding_token = generateToken();
      updateData.onboarding_status = "pending";
    }
    
    const { data, error } = await supabase
      .from("coach_applications")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: `Application ${newStatus}`,
        description: `The application has been ${newStatus}.`,
      });
      // Update local state with returned data
      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, ...data } : app
        )
      );
    }
    setUpdatingId(null);
  };

  const copyOnboardingLink = (token: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/coach/onboarding?token=${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Onboarding link has been copied to clipboard.",
    });
  };

  const getOnboardingBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Completed</Badge>;
      case "pending":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Pending</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">—</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  // Loading state while checking access
  if (accessState === "loading") {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  // Access denied state - show message instead of redirecting
  if (accessState === "denied") {
    return (
      <Layout>
        <section className="py-16">
          <div className="container-wide">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <ShieldX className="h-8 w-8 text-destructive" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold mb-2">Admin access required</h1>
                    <p className="text-muted-foreground">
                      You do not have permission to view this page. Please contact an administrator if you believe this is an error.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16">
        <div className="container-wide">
          {/* Clear page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-primary" />
              Coach Applications (Admin)
            </h1>
            <p className="text-muted-foreground mt-2">
              Review and manage coach applications
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>
                {applications.length} total application{applications.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No applications found.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Onboarding</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.full_name}</TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{format(new Date(app.created_at), "MMM d, yyyy")}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell>{getOnboardingBadge(app.onboarding_status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {app.status === "approved" && app.onboarding_token && app.onboarding_status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyOnboardingLink(app.onboarding_token!)}
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy Link
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                disabled={app.status === "approved" || updatingId === app.id}
                                onClick={() => updateStatus(app.id, "approved")}
                              >
                                {updatingId === app.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={app.status === "rejected" || updatingId === app.id}
                                onClick={() => updateStatus(app.id, "rejected")}
                              >
                                {updatingId === app.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

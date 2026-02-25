import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle, XCircle, Clock, Loader2, ShieldAlert, ShieldX,
  Copy, Eye, Send, AlertTriangle, ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { ApplicationDetailDialog } from "@/components/admin/ApplicationDetailDialog";
import { ReviewerNotesDialog } from "@/components/admin/ReviewerNotesDialog";

interface CoachApplication {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  bio: string | null;
  experience_years: number | null;
  certifications: string | null;
  specialties: string[] | null;
  why_galoras: string | null;
  phone: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  onboarding_token: string | null;
  onboarding_status: string | null;
  onboarding_short_id: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  // New structured fields
  coach_background: string | null;
  coach_background_detail: string | null;
  certification_interest: string | null;
  coaching_experience_years: string | null;
  leadership_experience_years: string | null;
  current_role: string | null;
  coaching_experience_level: string | null;
  primary_join_reason: string | null;
  commitment_level: string | null;
  start_timeline: string | null;
  excitement_note: string | null;
  pillar_specialties: string[] | null;
  coaching_philosophy: string | null;
  // New structured intake fields
  primary_pillar: string | null;
  secondary_pillars: string[] | null;
  industry_focus: string[] | null;
  coaching_style: string[] | null;
  engagement_model: string | null;
  availability_status: string | null;
  founder_stage_focus: string[] | null;
  founder_function_strength: string[] | null;
  exec_level: string | null;
  exec_function: string[] | null;
}

export default function Applicants() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<CoachApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessState, setAccessState] = useState<"loading" | "denied" | "granted">("loading");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detailApp, setDetailApp] = useState<CoachApplication | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CoachApplication | null>(null);
  const [changesTarget, setChangesTarget] = useState<CoachApplication | null>(null);

  useEffect(() => { checkAdminAccess(); }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAccessState("denied"); setIsLoading(false); return; }
    const { data: roleData } = await supabase
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) { setAccessState("denied"); setIsLoading(false); return; }
    setAccessState("granted");
    fetchApplications();
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("coach_applications").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error fetching applications", description: error.message, variant: "destructive" });
    } else {
      setApplications(data || []);
    }
    setIsLoading(false);
  };

  // Queues
  const queueA = useMemo(() => applications.filter((a) => a.status === "pending"), [applications]);
  const queueB = useMemo(
    () => applications.filter((a) => a.status === "approved" && a.onboarding_status === "completed"),
    [applications]
  );

  const approveApplication = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await supabase.functions.invoke("create-onboarding-link", {
        body: { applicationId: id },
      });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: "Application approved", description: "Masked onboarding link created." });
      fetchApplications();
    } catch (err: any) {
      toast({ title: "Approve failed", description: err.message || String(err), variant: "destructive" });
    }
    setUpdatingId(null);
  };

  const regenerateLink = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await supabase.functions.invoke("create-onboarding-link", {
        body: { applicationId: id },
      });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: "Link regenerated", description: "New masked link created. Old links expired." });
      fetchApplications();
    } catch (err: any) {
      toast({ title: "Regenerate failed", description: err.message || String(err), variant: "destructive" });
    }
    setUpdatingId(null);
  };

  const rejectApplication = async (notes: string) => {
    if (!rejectTarget) return;
    setUpdatingId(rejectTarget.id);
    const { data, error } = await supabase
      .from("coach_applications")
      .update({
        status: "rejected" as const,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: notes || null,
      })
      .eq("id", rejectTarget.id)
      .select()
      .single();

    if (error) {
      toast({ title: "Reject failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Application rejected" });
      setApplications((prev) => prev.map((a) => (a.id === rejectTarget.id ? { ...a, ...data } : a)));
    }
    setUpdatingId(null);
    setRejectTarget(null);
  };

  const publishCoach = async (app: CoachApplication) => {
    setUpdatingId(app.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("publish-coach", {
        body: { applicationId: app.id },
      });

      if (res.error) throw res.error;

      toast({ title: "Coach published!", description: `${app.full_name} is now visible in the directory.` });
      // Refresh
      fetchApplications();
    } catch (err: any) {
      toast({ title: "Publish failed", description: err.message || String(err), variant: "destructive" });
    }
    setUpdatingId(null);
  };

  const requestChanges = async (notes: string) => {
    if (!changesTarget) return;
    setUpdatingId(changesTarget.id);
    const { data, error } = await supabase
      .from("coach_applications")
      .update({
        onboarding_status: "needs_changes",
        reviewed_at: new Date().toISOString(),
        reviewer_notes: notes || null,
      })
      .eq("id", changesTarget.id)
      .select()
      .single();

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Changes requested" });
      setApplications((prev) => prev.map((a) => (a.id === changesTarget.id ? { ...a, ...data } : a)));
    }
    setUpdatingId(null);
    setChangesTarget(null);
  };

  const getOnboardingUrl = (app: CoachApplication) => {
    if (app.onboarding_short_id) {
      return `${window.location.origin}/onboard/${app.onboarding_short_id}`;
    }
    return null;
  };

  const openOnboardingLink = (app: CoachApplication) => {
    const url = getOnboardingUrl(app);
    if (!url) {
      toast({ title: "No masked link", description: "Use Regenerate Link.", variant: "destructive" });
      return;
    }
    window.open(url, "_blank");
  };

  const copyOnboardingLink = (app: CoachApplication) => {
    const url = getOnboardingUrl(app);
    if (!url) {
      toast({ title: "No masked link", description: "Use Regenerate Link.", variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Onboarding link copied to clipboard." });
  };

  // Status badges
  const statusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected": return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default: return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const onboardingBadge = (os: string | null) => {
    switch (os) {
      case "published": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Published</Badge>;
      case "completed": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Completed</Badge>;
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case "needs_changes": return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Needs Changes</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground">—</Badge>;
    }
  };

  // Loading / denied states
  if (accessState === "loading") {
    return <Layout><div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></Layout>;
  }
  if (accessState === "denied") {
    return (
      <Layout>
        <section className="py-16"><div className="container-wide">
          <Card className="max-w-md mx-auto"><CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldX className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-semibold mb-2">Admin access required</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
              </div>
            </div>
          </CardContent></Card>
        </div></section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16">
        <div className="container-wide">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-primary" />
              Admin — Coach Approval Console
            </h1>
            <p className="text-muted-foreground mt-2">Two-step approval: Applications → Profiles → Directory</p>
          </div>

          <Tabs defaultValue="applications">
            <TabsList>
              <TabsTrigger value="applications">Applications ({queueA.length})</TabsTrigger>
              <TabsTrigger value="profiles">Profiles ({queueB.length})</TabsTrigger>
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            </TabsList>

            {/* Queue A */}
            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Applications</CardTitle>
                  <CardDescription>New coach applications awaiting review</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? <LoadingState /> : queueA.length === 0 ? <EmptyState text="No pending applications." /> : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {queueA.map((app) => (
                            <TableRow key={app.id}>
                              <TableCell className="font-medium">{app.full_name}</TableCell>
                              <TableCell>{app.email}</TableCell>
                              <TableCell>{format(new Date(app.created_at), "MMM d, yyyy")}</TableCell>
                              <TableCell>{statusBadge(app.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="outline" onClick={() => setDetailApp(app)}>
                                    <Eye className="h-4 w-4 mr-1" />View
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    disabled={updatingId === app.id} onClick={() => approveApplication(app.id)}>
                                    {updatingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-1" />Approve</>}
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    disabled={updatingId === app.id} onClick={() => setRejectTarget(app)}>
                                    <XCircle className="h-4 w-4 mr-1" />Reject
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
            </TabsContent>

            {/* Queue B */}
            <TabsContent value="profiles">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Profiles</CardTitle>
                  <CardDescription>Coaches who completed onboarding, awaiting final approval</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? <LoadingState /> : queueB.length === 0 ? <EmptyState text="No profiles awaiting review." /> : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {queueB.map((app) => (
                            <TableRow key={app.id}>
                              <TableCell className="font-medium">{app.full_name}</TableCell>
                              <TableCell>{app.email}</TableCell>
                              <TableCell>{format(new Date(app.created_at), "MMM d, yyyy")}</TableCell>
                              <TableCell>{onboardingBadge(app.onboarding_status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="outline" onClick={() => setDetailApp(app)}>
                                    <Eye className="h-4 w-4 mr-1" />View
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    disabled={updatingId === app.id} onClick={() => publishCoach(app)}>
                                    {updatingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1" />Publish</>}
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                    disabled={updatingId === app.id} onClick={() => setChangesTarget(app)}>
                                    <AlertTriangle className="h-4 w-4 mr-1" />Request Changes
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
            </TabsContent>

            {/* All */}
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Applications</CardTitle>
                  <CardDescription>{applications.length} total</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? <LoadingState /> : applications.length === 0 ? <EmptyState text="No applications found." /> : (
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
                              <TableCell>{statusBadge(app.status)}</TableCell>
                              <TableCell>{onboardingBadge(app.onboarding_status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {app.status === "approved" && app.onboarding_short_id && (app.onboarding_status === "pending" || app.onboarding_status === "needs_changes") && (
                                    <>
                                      <Button size="sm" onClick={() => openOnboardingLink(app)}>
                                        <ExternalLink className="h-4 w-4 mr-1" />Open Onboarding
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => copyOnboardingLink(app)}>
                                        <Copy className="h-4 w-4 mr-1" />Copy
                                      </Button>
                                    </>
                                  )}
                                  {app.status === "approved" && !app.onboarding_short_id && app.onboarding_status !== "completed" && (
                                    <Button size="sm" variant="outline" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                      disabled={updatingId === app.id} onClick={() => regenerateLink(app.id)}>
                                      {updatingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Regenerate Link"}
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" onClick={() => setDetailApp(app)}>
                                    <Eye className="h-4 w-4 mr-1" />View
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
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Dialogs */}
      <ApplicationDetailDialog application={detailApp} open={!!detailApp} onOpenChange={(o) => !o && setDetailApp(null)} />
      <ReviewerNotesDialog
        open={!!rejectTarget}
        onOpenChange={(o) => !o && setRejectTarget(null)}
        title="Reject Application"
        description={`Reject ${rejectTarget?.full_name}'s application?`}
        confirmLabel="Reject"
        confirmVariant="destructive"
        isLoading={updatingId === rejectTarget?.id}
        onConfirm={rejectApplication}
      />
      <ReviewerNotesDialog
        open={!!changesTarget}
        onOpenChange={(o) => !o && setChangesTarget(null)}
        title="Request Changes"
        description={`Request changes to ${changesTarget?.full_name}'s profile?`}
        confirmLabel="Request Changes"
        confirmVariant="default"
        isLoading={updatingId === changesTarget?.id}
        onConfirm={requestChanges}
      />
    </Layout>
  );
}

function LoadingState() {
  return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-center py-12 text-muted-foreground">{text}</div>;
}

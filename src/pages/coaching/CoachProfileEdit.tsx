import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CoachPhotoUpload } from '@/components/coaching/CoachPhotoUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function CoachProfileEdit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch coach profile
  const { data: coachProfile, isLoading: coachLoading } = useQuery({
    queryKey: ['my-coach-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Update coach profile mutation
  const updateProfile = useMutation({
    mutationFn: async ({ avatarUrl, cutoutUrl }: { avatarUrl: string; cutoutUrl: string }) => {
      const { error } = await supabase
        .from('coaches')
        .update({
          avatar_url: avatarUrl,
          cutout_url: cutoutUrl,
        })
        .eq('id', coachProfile!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-coach-profile'] });
      queryClient.invalidateQueries({ queryKey: ['featured-coaches'] });
      toast({
        title: 'Profile Updated',
        description: 'Your photos have been saved successfully.',
      });
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to save your profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/auth');
    }
  }, [user, userLoading, navigate]);

  if (userLoading || coachLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!coachProfile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Coach Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            You need to be an approved coach to edit your profile.
          </p>
          <Button onClick={() => navigate('/apply')}>Apply as Coach</Button>
        </div>
      </Layout>
    );
  }

  const handlePhotoSave = (avatarUrl: string, cutoutUrl: string) => {
    updateProfile.mutate({ avatarUrl, cutoutUrl });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/coach-dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-2">
            Update your coach profile photo and create a cutout for the featured section.
          </p>
        </div>

        <div className="space-y-6">
          <CoachPhotoUpload
            coachId={coachProfile.id}
            userId={user!.id}
            currentAvatarUrl={coachProfile.avatar_url}
            currentCutoutUrl={coachProfile.cutout_url}
            onSave={handlePhotoSave}
          />

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                  <p className="text-lg">{coachProfile.display_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Headline</p>
                  <p>{coachProfile.headline || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="capitalize">{coachProfile.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Featured</p>
                  <p>{coachProfile.is_featured ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

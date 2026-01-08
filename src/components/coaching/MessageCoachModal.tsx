import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Send, Lock, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

interface MessageCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachId: string;
  coachName: string;
  coachUserId: string;
}

export function MessageCoachModal({ 
  isOpen, 
  onClose, 
  coachId, 
  coachName,
  coachUserId 
}: MessageCoachModalProps) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: coachUserId,
        subject: subject || `Message from ${user.email}`,
        content,
      });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: `Your message has been sent to ${coachName}.`,
      });

      setSubject("");
      setContent("");
      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Message {coachName}</DialogTitle>
          <DialogDescription>
            Send a direct message to this coach to discuss your goals.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Sign in to message coaches</h3>
            <p className="text-muted-foreground text-sm">
              Create a free account to message coaches directly and start your coaching journey.
            </p>
            <Link to="/auth" onClick={onClose}>
              <Button className="mt-2">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In / Sign Up
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                placeholder="e.g., Interested in leadership coaching"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                required
                rows={5}
                placeholder="Hi! I'm interested in your coaching services. I'd love to discuss..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !content.trim()}>
                <Send className="mr-2 h-4 w-4" />
                {isLoading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

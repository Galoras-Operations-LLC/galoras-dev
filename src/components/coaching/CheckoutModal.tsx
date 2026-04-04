import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Checkout</DialogTitle>
        <p className="text-muted-foreground">Checkout functionality coming soon.</p>
      </DialogContent>
    </Dialog>
  );
}

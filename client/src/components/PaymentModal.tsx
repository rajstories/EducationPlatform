import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Subject } from "@shared/schema";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
}

const PaymentModal = ({ isOpen, onClose, subject }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  if (!subject) return null;

  const gst = Math.round(subject.price * 0.18);
  const totalAmount = subject.price + gst;

  const handlePayment = async (method: 'razorpay' | 'upi') => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
      toast({
        title: "Payment Successful!",
        description: `Enrollment completed for ${subject.name}. You will receive access details via email.`,
      });
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-navy">
            Complete Your Enrollment
          </DialogTitle>
          <p className="text-center text-gray-600 text-sm">
            {subject.name} - {subject.classId.replace('class-', 'Class ')}
          </p>
        </DialogHeader>

        <div className="border-t border-b py-4 my-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subject Fee:</span>
            <span className="font-semibold">₹{subject.price}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">GST (18%):</span>
            <span className="font-semibold">₹{gst}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
            <span>Total Amount:</span>
            <span className="text-blue-600">₹{totalAmount}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => handlePayment('razorpay')}
            disabled={isProcessing}
            data-testid="button-pay-razorpay"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
          </Button>
          
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => handlePayment('upi')}
            disabled={isProcessing}
            data-testid="button-pay-upi"
          >
            <Smartphone className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Pay with UPI'}
          </Button>
        </div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={onClose}
          disabled={isProcessing}
          data-testid="button-cancel-payment"
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;

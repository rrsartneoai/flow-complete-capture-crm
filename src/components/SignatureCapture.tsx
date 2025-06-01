
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Signature, X, Check } from "lucide-react";

interface SignatureCaptureProps {
  onSignatureComplete: () => void;
  completed: boolean;
}

const SignatureCapture = ({ onSignatureComplete, completed }: SignatureCaptureProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Set drawing styles
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    if (!hasSignature) {
      toast({
        title: "No Signature",
        description: "Please provide your signature before proceeding.",
        variant: "destructive",
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to blob and save
    canvas.toBlob((blob) => {
      if (blob) {
        console.log("Signature saved:", blob);
        onSignatureComplete();
      }
    });
  };

  if (completed) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center space-x-3">
          <Check className="h-6 w-6 text-green-600" />
          <div>
            <h4 className="font-medium text-green-900">Signature Captured</h4>
            <p className="text-sm text-green-700">Your electronic signature has been recorded successfully.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Signature className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h4 className="text-lg font-medium mb-2">Electronic Signature Required</h4>
        <p className="text-gray-600">
          Please sign below to authorize the processing of your documents and agree to the terms.
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Signature
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair bg-white rounded"
              style={{ height: "200px" }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </Button>

          <Button
            onClick={saveSignature}
            disabled={!hasSignature}
            className="flex items-center space-x-2"
          >
            <Check className="h-4 w-4" />
            <span>Save Signature</span>
          </Button>
        </div>
      </Card>

      <div className="text-xs text-gray-500 text-center">
        By signing above, you agree to our terms and conditions and authorize 
        the processing of your submitted documents.
      </div>
    </div>
  );
};

export default SignatureCapture;

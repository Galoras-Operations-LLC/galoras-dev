import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  removeBackground, 
  loadImage, 
  initializeModel, 
  isWebGPUSupported 
} from '@/lib/background-removal';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Wand2, Save, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CoachPhotoUploadProps {
  coachId: string;
  userId: string;
  currentAvatarUrl?: string | null;
  currentCutoutUrl?: string | null;
  onSave: (avatarUrl: string, cutoutUrl: string) => void;
}

export function CoachPhotoUpload({
  coachId,
  userId,
  currentAvatarUrl,
  currentCutoutUrl,
  onSave,
}: CoachPhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [webGPUSupported, setWebGPUSupported] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Check WebGPU support on mount
  useState(() => {
    isWebGPUSupported().then(setWebGPUSupported);
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    setCutoutUrl(null);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setModelProgress(0);

    try {
      // Initialize model with progress tracking
      setProcessingStep('Loading AI model (first time may take a moment)...');
      await initializeModel((progress) => {
        setModelProgress(Math.round(progress));
      });

      // Load and process image
      setProcessingStep('Processing image...');
      setModelProgress(100);
      
      const img = await loadImage(selectedFile);
      const resultBlob = await removeBackground(img);

      // Create preview URL for the cutout
      const cutoutPreviewUrl = URL.createObjectURL(resultBlob);
      setCutoutUrl(cutoutPreviewUrl);

      toast({
        title: 'Background removed!',
        description: 'Review the result and save when ready.',
      });
    } catch (error) {
      console.error('Background removal failed:', error);
      toast({
        title: 'Processing failed',
        description: error instanceof Error ? error.message : 'Failed to remove background. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleSave = async () => {
    if (!selectedFile || !cutoutUrl) return;

    setIsSaving(true);

    try {
      // Upload original avatar
      const avatarPath = `avatars/${userId}/${Date.now()}.jpg`;
      const { error: avatarError } = await supabase.storage
        .from('coach-images')
        .upload(avatarPath, selectedFile, {
          upsert: true,
          contentType: selectedFile.type,
        });

      if (avatarError) throw avatarError;

      // Get the cutout blob from the preview URL
      const cutoutResponse = await fetch(cutoutUrl);
      const cutoutBlob = await cutoutResponse.blob();

      // Upload cutout
      const cutoutPath = `cutouts/${userId}/${Date.now()}.png`;
      const { error: cutoutError } = await supabase.storage
        .from('coach-images')
        .upload(cutoutPath, cutoutBlob, {
          upsert: true,
          contentType: 'image/png',
        });

      if (cutoutError) throw cutoutError;

      // Get public URLs
      const { data: avatarData } = supabase.storage
        .from('coach-images')
        .getPublicUrl(avatarPath);

      const { data: cutoutData } = supabase.storage
        .from('coach-images')
        .getPublicUrl(cutoutPath);

      onSave(avatarData.publicUrl, cutoutData.publicUrl);

      toast({
        title: 'Photos saved!',
        description: 'Your profile photos have been updated.',
      });

      // Clean up
      setSelectedFile(null);
      setPreviewUrl(null);
      setCutoutUrl(null);
    } catch (error) {
      console.error('Failed to save photos:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to upload photos. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Profile Photo</h3>
          <p className="text-sm text-muted-foreground">
            Upload a photo and use AI to create a transparent cutout for the featured section.
          </p>
        </div>

        {webGPUSupported === false && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              WebGPU is not supported in your browser. Background removal may be slower or unavailable.
              Try using Chrome or Edge for best results.
            </AlertDescription>
          </Alert>
        )}

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Current Photos Display */}
        {!selectedFile && (currentAvatarUrl || currentCutoutUrl) && (
          <div className="grid grid-cols-2 gap-4">
            {currentAvatarUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-center">Current Avatar</p>
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={currentAvatarUrl}
                    alt="Current avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            {currentCutoutUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-center">Current Cutout</p>
                <div className="aspect-square rounded-lg overflow-hidden bg-[url('/placeholder.svg')] bg-center bg-cover">
                  <img
                    src={currentCutoutUrl}
                    alt="Current cutout"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Button */}
        {!selectedFile && (
          <Button
            variant="outline"
            className="w-full h-32 border-dashed"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span>Click to upload a photo</span>
              <span className="text-xs text-muted-foreground">JPG, PNG up to 5MB</span>
            </div>
          </Button>
        )}

        {/* Preview Grid */}
        {selectedFile && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Original</p>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Original preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Cutout Preview</p>
              <div className="aspect-square rounded-lg overflow-hidden bg-[url('/placeholder.svg')] bg-center bg-cover flex items-center justify-center">
                {cutoutUrl ? (
                  <img
                    src={cutoutUrl}
                    alt="Cutout preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {isProcessing ? 'Processing...' : 'Click "Remove Background"'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{processingStep}</span>
              <span>{modelProgress}%</span>
            </div>
            <Progress value={modelProgress} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        {selectedFile && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setCutoutUrl(null);
              }}
              disabled={isProcessing || isSaving}
            >
              Cancel
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleRemoveBackground}
              disabled={isProcessing || isSaving || !!cutoutUrl}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Remove Background
                </>
              )}
            </Button>

            <Button
              onClick={handleSave}
              disabled={!cutoutUrl || isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Photos
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

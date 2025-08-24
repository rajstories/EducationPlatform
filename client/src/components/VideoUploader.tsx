import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, Video, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Class, Subject, Chapter } from "@shared/schema";

const videoUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional(),
  duration: z.number().optional(),
  thumbnailUrl: z.string().optional(),
});

type VideoUploadFormData = z.infer<typeof videoUploadSchema>;

interface VideoUploaderProps {
  onUploadComplete?: (videoContent: any) => void;
  className?: string;
}

export function VideoUploader({ onUploadComplete, className }: VideoUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<VideoUploadFormData>({
    resolver: zodResolver(videoUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      classId: "",
      subjectId: "",
      chapterId: "",
    },
  });

  const selectedClassId = form.watch("classId");
  const selectedSubjectId = form.watch("subjectId");

  // Fetch classes
  const { data: classes } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
  });

  // Fetch subjects for selected class
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ['/api/subjects', selectedClassId],
    enabled: !!selectedClassId,
  });

  // Fetch chapters for selected subject
  const { data: chapters } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters', selectedSubjectId],
    enabled: !!selectedSubjectId,
  });

  const createVideoContentMutation = useMutation({
    mutationFn: async (data: VideoUploadFormData & { videoId: string }) => {
      return apiRequest("POST", "/api/admin/content", {
        ...data,
        type: "video",
        videoId: data.videoId,
        isPublished: true,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Video lecture uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      onUploadComplete?.(data);
      setIsOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create video content",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid File",
          description: "Please select a video file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Video file must be less than 500MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Auto-fill title from filename
      if (!form.getValues("title")) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        form.setValue("title", fileName);
      }
    }
  };

  const uploadVideo = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get upload URL
      const { uploadURL } = await apiRequest("POST", "/api/admin/upload");

      // Upload file with progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            setVideoUrl(uploadURL);
            resolve(uploadURL);
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("PUT", uploadURL);
        xhr.setRequestHeader("Content-Type", selectedFile.type);
        xhr.send(selectedFile);
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload video file",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: VideoUploadFormData) => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload video file first
      const uploadedVideoUrl = await uploadVideo();
      
      // Extract video ID from URL for database storage
      const videoId = uploadedVideoUrl.split('/').pop() || '';
      
      // Create video content record
      await createVideoContentMutation.mutateAsync({
        ...data,
        videoId,
      });
    } catch (error) {
      console.error("Video upload error:", error);
    }
  };

  const resetForm = () => {
    form.reset();
    setSelectedFile(null);
    setUploadProgress(0);
    setVideoUrl("");
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className} data-testid="video-upload-trigger">
          <Video className="h-4 w-4 mr-2" />
          Upload Video Lecture
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="video-upload-dialog">
        <DialogHeader>
          <DialogTitle>Upload Video Lecture</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="text-sm font-medium">Video File</div>
              
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    Click to select a video file or drag and drop
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    Supported formats: MP4, AVI, MOV (Max 500MB)
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="video-file-input"
                    data-testid="video-file-input"
                  />
                  <label htmlFor="video-file-input">
                    <Button type="button" variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Select Video File
                      </span>
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="border rounded-lg p-4" data-testid="selected-file-info">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Video className="h-6 w-6 text-blue-600" />
                      <div>
                        <div className="font-medium" data-testid="selected-file-name">{selectedFile.name}</div>
                        <div className="text-sm text-gray-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      data-testid="remove-file-button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {uploadProgress > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" data-testid="upload-progress" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video Information Fields */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter video title" 
                        {...field} 
                        data-testid="video-title-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter video description" 
                        {...field} 
                        data-testid="video-description-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="class-select">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="subject-select">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects?.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="chapterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="chapter-select">
                          <SelectValue placeholder="Select chapter (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No specific chapter</SelectItem>
                        {chapters?.map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            {chapter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedFile || isUploading || createVideoContentMutation.isPending}
                data-testid="upload-submit-button"
              >
                {isUploading ? "Uploading..." : "Upload Video Lecture"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
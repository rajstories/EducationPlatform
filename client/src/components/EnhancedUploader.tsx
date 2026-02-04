import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText, File as FileIcon, BookOpen } from "lucide-react";
import type { Class, Subject, Chapter } from "@shared/schema";

const uploadFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional(),
  chapterNumber: z.string().min(1, "Chapter number is required"),
  chapterName: z.string().min(1, "Chapter name is required"),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

interface EnhancedUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  contentType: "notes" | "test" | "pyq" | "result" | "announcement";
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (data: UploadFormData & { uploadedFiles: { url: string; name: string; size: number; type: string }[] }) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function EnhancedUploader({
  maxNumberOfFiles = 5,
  maxFileSize = 10485760, // 10MB default
  acceptedFileTypes,
  contentType,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: EnhancedUploaderProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<"form" | "files">("form");

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      description: "",
      classId: "",
      subjectId: "",
      chapterId: "",
      chapterNumber: "",
      chapterName: "",
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
    queryKey: [`/api/classes/${selectedClassId}/subjects`],
    enabled: !!selectedClassId,
  });

  // Fetch chapters for selected subject
  const { data: chapters } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters', selectedSubjectId],
    enabled: !!selectedSubjectId,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      // Check file size
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`);
        return false;
      }
      
      // Check file type
      if (acceptedFileTypes && acceptedFileTypes.length > 0) {
        const isAccepted = acceptedFileTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          } else {
            return file.type.includes(type);
          }
        });
        if (!isAccepted) {
          alert(`File ${file.name} type is not accepted.`);
          return false;
        }
      }
      
      return true;
    });

    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxNumberOfFiles) {
      alert(`Maximum ${maxNumberOfFiles} files allowed`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: UploadFormData) => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file to upload");
      return;
    }
    setStep("files");
  };

  const uploadFiles = async () => {
    const formData = form.getValues();
    setIsUploading(true);
    const results: { url: string; name: string; size: number; type: string }[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileId = `${file.name}-${i}`;
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        try {
          // Get upload URL from backend
          const { url } = await onGetUploadParameters();
          
          // Upload file to object storage
          const response = await fetch(url, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          });

          if (response.ok) {
            setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
            results.push({
              url: url.split('?')[0], // Remove query parameters to get clean URL
              name: file.name,
              size: file.size,
              type: file.type,
            });
          } else {
            throw new Error(`Upload failed: ${response.statusText}`);
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          alert(`Failed to upload ${file.name}`);
        }
      }

      // Call completion handler with form data and uploaded files
      onComplete?.({
        ...formData,
        uploadedFiles: results,
      });
      
      // Reset state
      resetUploader();
      
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploader = () => {
    setSelectedFiles([]);
    setUploadProgress({});
    setShowUploader(false);
    setStep("form");
    form.reset();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (file.type.includes('image')) return <FileIcon className="w-4 h-4 text-blue-500" />;
    if (file.type.includes('text') || file.type.includes('document')) return <FileText className="w-4 h-4 text-green-500" />;
    return <FileIcon className="w-4 h-4 text-gray-500" />;
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case "notes": return "Study Notes";
      case "test": return "Test Papers";
      case "pyq": return "Previous Year Questions";
      case "result": return "Results";
      case "announcement": return "Announcement";
      default: return "Content";
    }
  };

  return (
    <div>
      <Button onClick={() => setShowUploader(true)} className={buttonClassName}>
        {children}
      </Button>

      {showUploader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Upload {getContentTypeLabel()}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {step === "form" ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={`Enter ${getContentTypeLabel().toLowerCase()} title`}
                              data-testid="input-content-title"
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
                              {...field}
                              placeholder="Optional description"
                              rows={2}
                              data-testid="textarea-content-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="classId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-class">
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

                    {selectedClassId && (
                      <FormField
                        control={form.control}
                        name="subjectId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-subject">
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
                    )}

                    {selectedSubjectId && chapters && chapters.length > 0 && (
                      <FormField
                        control={form.control}
                        name="chapterId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chapter (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-chapter">
                                  <SelectValue placeholder="Select chapter (optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">All Chapters</SelectItem>
                                {chapters.map((chapter) => (
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
                    )}

                    {/* Chapter Number and Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="chapterNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chapter Number *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., 1, 2, 3..." 
                                {...field} 
                                data-testid="input-chapter-number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="chapterName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chapter Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Motion in a Straight Line" 
                                {...field} 
                                data-testid="input-chapter-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* File Selection Area */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Files *</label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                        onDrop={(e) => {
                          e.preventDefault();
                          const files = Array.from(e.dataTransfer.files);
                          addFiles(files);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag and drop files here, or click to select
                        </p>
                        <Input
                          type="file"
                          multiple={maxNumberOfFiles > 1}
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-input"
                          accept={acceptedFileTypes?.join(',')}
                        />
                        <Button type="button" variant="outline" onClick={() => document.getElementById('file-input')?.click()}>
                          Select Files
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          Max {maxNumberOfFiles} files, {Math.round(maxFileSize / 1024 / 1024)}MB each
                        </p>
                      </div>
                    </div>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2 flex-1">
                                {getFileIcon(file)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={resetUploader}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={selectedFiles.length === 0}>
                        Continue to Upload
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Ready to Upload</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected for upload
                    </p>
                  </div>

                  {/* Upload Progress */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedFiles.map((file, index) => {
                        const fileId = `${file.name}-${index}`;
                        const progress = uploadProgress[fileId] || 0;
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2 flex-1">
                              {getFileIcon(file)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            
                            {isUploading && progress > 0 && (
                              <div className="w-16 text-xs text-center">
                                {progress}%
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setStep("form")} disabled={isUploading}>
                      Back
                    </Button>
                    <Button onClick={uploadFiles} disabled={isUploading}>
                      {isUploading ? "Uploading..." : "Upload Files"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
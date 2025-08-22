import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, FileText, File as FileIcon } from "lucide-react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (uploadedFiles: { url: string; name: string; size: number; type: string }[]) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides drag & drop interface
 * for file management with progress tracking.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed (default: 5)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.acceptedFileTypes - Array of accepted file types (default: all)
 * @param props.onGetUploadParameters - Function to get upload parameters from backend
 * @param props.onComplete - Callback when all uploads complete
 * @param props.buttonClassName - Optional CSS class for button
 * @param props.children - Button content
 */
export function ObjectUploader({
  maxNumberOfFiles = 5,
  maxFileSize = 10485760, // 10MB default
  acceptedFileTypes,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; size: number; type: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

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

      setUploadedFiles(results);
      onComplete?.(results);
      
      // Reset state
      setSelectedFiles([]);
      setUploadProgress({});
      setShowUploader(false);
      
    } finally {
      setIsUploading(false);
    }
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

  return (
    <div>
      <Button onClick={() => setShowUploader(true)} className={buttonClassName}>
        {children}
      </Button>

      {showUploader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Upload Files</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowUploader(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* File Selection Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4"
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
                <Button variant="outline" onClick={() => document.getElementById('file-input')?.click()}>
                  Select Files
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Max {maxNumberOfFiles} files, {Math.round(maxFileSize / 1024 / 1024)}MB each
                </p>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
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
                          
                          {!isUploading && (
                            <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUploader(false)} disabled={isUploading}>
                  Cancel
                </Button>
                <Button 
                  onClick={uploadFiles} 
                  disabled={selectedFiles.length === 0 || isUploading}
                  data-testid="button-upload"
                >
                  {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
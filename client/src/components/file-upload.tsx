import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { CloudUpload, FileText, X, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FileUpload({ onSuccess, onCancel }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await apiRequest('POST', '/api/upload-csv', formData);
      return response.json();
    },
    onSuccess: () => {
      setSelectedFile(null);
      onSuccess();
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      setSelectedFile(csvFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upload Your Portfolio</h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {uploadMutation.isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {uploadMutation.error instanceof Error ? uploadMutation.error.message : "Failed to upload file"}
            </AlertDescription>
          </Alert>
        )}

        {uploadMutation.isSuccess && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              CSV file uploaded and processed successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <CloudUpload className="text-primary text-2xl" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Drop your CSV file here or click to browse</p>
          
          <div
            className={`border-2 border-dashed rounded-lg p-12 transition-colors cursor-pointer ${
              dragActive 
                ? "border-primary bg-blue-50 dark:bg-blue-900/20" 
                : "border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/20"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            
            {selectedFile ? (
              <div className="text-center">
                <FileText className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <FileText className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Choose CSV file or drag and drop</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Supports: .csv files up to 10MB</p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="mt-6 flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setSelectedFile(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={uploadMutation.isPending}
                className="bg-primary text-white hover:bg-blue-700"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload & Process"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

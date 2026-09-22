import React, { InputHTMLAttributes, useState, useRef } from 'react';
import { UploadCloud, File, X, Image as ImageIcon } from 'lucide-react';

export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  onFileSelect?: (file: File | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  helperText = 'Supported formats: JPG, PNG, WebP (Max 5MB)',
  onFileSelect,
  className = '',
  ...props
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    if (onFileSelect) onFileSelect(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className={`ns-file-upload-container ${className}`}>
      {label && <span className="ns-label">{label}</span>}
      {!selectedFile ? (
        <label className="ns-file-dropzone" tabIndex={0}>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="sr-only"
            {...props}
          />
          <div className="ns-file-dropzone__content">
            <div className="ns-file-dropzone__icon-circle">
              <UploadCloud size={24} className="ns-file-dropzone__icon" />
            </div>
            <p className="ns-file-dropzone__prompt">
              <span className="font-semibold text-primary">Click to upload photo evidence</span> or drag and drop
            </p>
            <p className="text-xs text-muted">{helperText}</p>
          </div>
        </label>
      ) : (
        <div className="ns-file-preview-card">
          <div className="ns-file-preview-info">
            {previewUrl ? (
              <img src={previewUrl} alt="Upload preview" className="ns-file-preview-thumb" />
            ) : (
              <File size={20} className="text-muted" />
            )}
            <div className="ns-file-preview-meta">
              <span className="ns-file-preview-name">{selectedFile.name}</span>
              <span className="text-xs text-muted">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="ns-file-remove-btn"
            aria-label="Remove uploaded file"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

'use client';
import axios from 'axios';
import qs from 'query-string';
import { FileIcon, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { UploadDropzone } from '@/lib/uploadthings';
import '@uploadthing/react/styles.css';
import { useState } from 'react';

interface FileUploadProps {
  endPoint: 'messageFile' | 'serverImage';
  value: string;
  onChange: (url?: string) => void;
}

const FileUpload = ({ endPoint, onChange, value }: FileUploadProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const fileType = value?.split('.').pop();

  const handleRemoveFile = async () => {
    try {
      setIsDeleting(true);
      const url = qs.stringifyUrl({
        url: '/api/uploadthing',
        query: {
          fileId: value?.substring(value?.lastIndexOf('/') + 1),
        },
      });
      await axios.delete(url);
    } catch (err) {
      console.log(err);
    } finally {
      setIsDeleting(false);
      onChange('');
    }
  };

  if (value && fileType !== 'pdf') {
    return (
      <div className="h-20 w-20 relative">
        <Image
          fill
          src={value}
          alt="upload"
          className="rounded-full object-cover"
        />
        <button
          onClick={handleRemoveFile}
          className={
            'absolute top-0 right-0 rounded-full bg-rose-500 text-white p-1 shadow-sm'
          }
          type="button"
          disabled={isDeleting}
        >
          {!isDeleting ? (
            <X className="h-4 w-4" />
          ) : (
            <Loader2 className="animate-spin h-4 w-4 text-white ml-auto" />
          )}
        </button>
      </div>
    );
  }

  if (value && fileType === 'pdf') {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 hover:underline text-xs text-indigo-500 dark:text-indigo-400"
        >
          {value}
        </a>
        <button
          onClick={handleRemoveFile}
          className={
            'absolute -top-2 -right-2 rounded-full bg-rose-500 text-white p-1 shadow-sm'
          }
          type="button"
          disabled={isDeleting}
        >
          {!isDeleting ? (
            <X className="h-4 w-4" />
          ) : (
            <Loader2 className="animate-spin h-4 w-4 text-white ml-auto" />
          )}
        </button>{' '}
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endPoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        console.log(error);
      }}
    />
  );
};

export default FileUpload;

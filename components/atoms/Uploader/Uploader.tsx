import styled from '@emotion/styled';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useRef, useState } from 'react';

import { storage } from '../../../services/auth/firebase';

const Progress = styled.progress`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 72px;

  &[value]::-webkit-progress-bar {
    background: white;
  }

  &[value]::-webkit-progress-value {
    background: var(--neutral-100);
  }
`;

const DEFAULT_MAX_FILE_SIZE_IN_BYTES = 500000;
const KILO_BYTES_PER_BYTE = 1000;

const convertBytesToKB = (bytes: number) => Math.round(bytes / KILO_BYTES_PER_BYTE);

interface UploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Mode defines the UI to be used */
  mode?: 'area' | 'button';
  /** Button label -- when using mode = 'button' */
  buttonLabel?: string;
  /** Optional label to add a form control style UI */
  label?: string;
  /** Optional pixels especially when handling image uploads to inform users on the maximum pixels required.  */
  pixels?: string;
  /** Optional accept string that allows the uploader to restrict or allow specific file types to be uploaded. */
  accept?: string;
  /** Optional maxSize -- in bytes */
  maxSize?: number;
  /** Callback function for updating the state from the parent component using this component. */
  onUpload?: (url: string) => void;
}

interface FileProps {
  percent: number;
  file: File;
  url?: string;
}

/**
 * Renders a VTVL branded upload component that supports click and drag&drop feature using html5 file input.
 * Can handle form control from a parent component by passing in the onFilesUpdate function.
 *
 * For enhancements:
 * - Support different modes of upload i.e, Drag&Drop area style (OK), Button only style -- import csv style.
 * - Refactor this and separate into smaller components.
 * - Let upload feature replace the old one when uploading continuously.
 * - Support multiple file upload?
 */
const Uploader = ({
  mode = 'area',
  buttonLabel = 'Browse File',
  label = '',
  accept = 'image/*',
  pixels = '512x512',
  onUpload,
  maxSize = DEFAULT_MAX_FILE_SIZE_IN_BYTES,
  multiple = false,
  ...props
}: UploadProps) => {
  // References to files and input element.
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  // Used object instead of array for ease of use, especially when deleting from a list.
  const [files, setFiles] = useState<FileProps[]>([]);
  // Add styling when dragging and dropping files.
  const [dragging, setDragging] = useState(false);
  // Progress bar state when uploading
  const [percent, setPercent] = useState(0);
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);

  // Triggers the click function of the hidden input element when the "Click upload" text is clicked.
  const handleUploadBtnClick = () => {
    // Always check if it's null
    if (null !== hiddenFileInput.current) hiddenFileInput.current.click();
  };

  // This function is used to handle adding new files in the files list
  const handleNewFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).map((file) => {
        // Reset first before uploading again
        removeFile();
        // Add to files array - in preparation for multiple file upload
        setFiles((prevFiles) => [...prevFiles, { percent: 0, file, url: '' }]);
        if (file.size <= maxSize) {
          let timer: ReturnType<typeof setInterval>;
          // const newFileName = generateRandomFileName() + extractExtension(file.name);
          const storageRef = ref(storage, `/files/${file.name}`);
          const uploadTask = uploadBytesResumable(storageRef, file);
          uploadTask.on(
            'state_changed',
            () => {
              // const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              timer = setInterval(
                () =>
                  setPercent((prevPercent) => {
                    if (prevPercent < 96) return prevPercent + 0.5;
                    return prevPercent;
                  }),
                10
              );
            },
            () => {
              setError(true);
              setPercent(0);
              setUrl('');
            },
            () => {
              // download url
              getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                clearInterval(timer);
                setUrl(url);
                setPercent(100);
                if (onUpload) onUpload(url);
              });
            }
          );
        } else {
          setError(true);
        }
      });
    }
  };

  // Function to remove the desired file and update the file list.
  const removeFile = () => {
    setFiles([]);
    setError(false);
    setPercent(0);
    setUrl('');
  };

  // Purpose is to loop through all of the existing files being uploaded and render their preview if they are an image.
  const renderImagePreviews = () => {
    return (
      <div className="flex flex-col items-stretch justify-center gap-3 w-full">
        {files.map((uploaded: FileProps, index) => {
          const { file } = uploaded;
          const isImageFile = file.type.split('/')[0] === 'image';
          return (
            <div
              key={`file-${index}-${file.name}`}
              className={`flex flex-row items-center justify-between gap-4 border rounded-lg bg-white overflow-hidden relative p-4 h-18 ${
                error
                  ? 'border-danger-700 bg-danger-100'
                  : url
                  ? 'border-success-400 bg-success-100'
                  : 'border-gray-300'
              }`}>
              <div className="flex flex-row gap-4 relative z-10">
                <div className="relative bg-gray-200 rounded-xl border border-gray-300 overflow-hidden flex items-center justify-center w-8 h-8">
                  {isImageFile && (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`file preview ${index}`}
                      className="max-w-xs max-h-10 object-cover"
                    />
                  )}
                </div>
                <div className="text-sm flex flex-col">
                  <span className="font-medium text-neutral-800">{file.name}</span>
                  <span className="text-neutral-500">
                    {convertBytesToKB(file.size)} kb - {percent}% uploaded
                  </span>
                </div>
              </div>
              {url || error ? (
                <>
                  <div
                    className="cursor-pointer p-1 flex items-center justify-center bg-neutral-100 rounded-full transition-all border-2 border-transparent hover:border-neutral-300"
                    onClick={() => removeFile()}>
                    <img src="/icons/trash.svg" alt={`Remove ${file.name}`} className="w-5 h-5" />
                  </div>
                </>
              ) : (
                <Progress value={percent} max={100} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col w-full mb-5">
        {label ? (
          <label className={`${props.required ? 'required' : null}`}>
            <span>{label}</span>
          </label>
        ) : null}
        <div
          className={`relative rounded-3xl border border-solid border-gray-300 p-3.5 flex flex-col items-center justify-center transition-all ${
            dragging ? 'outline outline-4 outline-gray-100' : ''
          }`}
          onDragOver={() => setDragging(true)}
          onDrop={() => setDragging(false)}>
          <div className="relative flex items-center justify-center">
            <div className="relative z-10 flex items-center justify-center bg-gray-100 rounded-full p-3 border-[6px] border-gray-50">
              <img src="/icons/upload-cloud.svg" alt={label} className="w-4 h-4" />
            </div>
            <div
              className={`${
                dragging ? 'animate-ping' : ''
              } absolute bg-gray-50 rounded-full flex items-center justify-center w-12 h-12`}></div>
          </div>
          <div className="relative z-10 mt-3 text-sm">
            <span className="text-sm text-primary-900 cursor-pointer" onClick={handleUploadBtnClick}>
              Click to upload
            </span>
            &nbsp;
            <span className="text-neutral-500">or drag and drop</span>
          </div>
          <div className="mt-1 text-neutral-500 text-sm">
            {accept.includes('.csv') ? 'CSV (max. size 1mb)' : `SVG, PNG or JPG (max. ${pixels} pixels)`}
          </div>
          <input
            ref={hiddenFileInput}
            type="file"
            className="absolute top-0 bottom-0 left-0 right-0 block opacity-0 focus:outline-0"
            title=""
            value=""
            accept={accept}
            onChange={handleNewFileUpload}
            {...props}
          />
        </div>
      </div>
      {/* Render the image if the mode is single and if the user has already had a file being uploaded */}
      {files.length ? renderImagePreviews() : null}
    </>
  );
};

export default Uploader;

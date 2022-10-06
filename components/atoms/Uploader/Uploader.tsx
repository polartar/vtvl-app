import CloseSvg from '@assets/icons/close.svg';
import UploadCloudSvg from '@assets/icons/upload-cloud.svg';
import React, { useRef, useState } from 'react';

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
  onFilesUpdate?: (files: unknown[]) => void;
}

/**
 * Renders a VTVL branded upload component that supports click and drag&drop feature using html5 file input.
 * Can handle form control from a parent component by passing in the onFilesUpdate function.
 *
 * For enhancements:
 * - Support different modes of upload i.e, Drag&Drop area style (OK), Button only style -- import csv style.
 */
export const Uploader = ({
  mode = 'area',
  buttonLabel = 'Browse File',
  label = '',
  accept = 'image/*',
  pixels = '512x512',
  onFilesUpdate,
  maxSize = DEFAULT_MAX_FILE_SIZE_IN_BYTES,
  ...props
}: UploadProps) => {
  // References to files and input element.
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  // Used object instead of array for ease of use, especially when deleting from a list.
  const [files, setFiles] = useState({});
  // Add styling when dragging and dropping files.
  const [dragging, setDragging] = useState(false);

  // Triggers the click function of the hidden input element when the "Click upload" text is clicked.
  const handleUploadBtnClick = () => {
    // Always check if it's null
    if (null !== hiddenFileInput.current) hiddenFileInput.current.click();
  };

  // This function is used to handle adding new files in the files list
  const handleNewFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files: newFiles } = e.target;
    if (newFiles?.length) {
      // const updatedFiles = addNewFiles(newFiles);
      // setFiles(updatedFiles);
      // callUpdateFilesCb(updatedFiles);
    }
  };

  // // This function is essentially adding the file in to the files object
  // const addNewFiles = (newFiles: FileList) => {
  //   for (const file of newFiles) {
  //     if (file.size <= maxSize) {
  //       if (!props.multiple) {
  //         return { file };
  //       }
  //       files[file.name as keyof Object] = file;
  //     }
  //   }
  //   return { ...files };
  // };

  // Convert object into array for compatibility to other third-party handlers or outside of this component.
  const convertNestedObjectToArray = (nestedObj: Record<string, unknown>) =>
    Object.keys(nestedObj).map((key) => nestedObj[key]);

  // Updates the parent component's value based on arrays from the converted list of files.
  const callUpdateFilesCb = (files: Record<string, unknown>) => {
    const filesAsArray = convertNestedObjectToArray(files);
    if (onFilesUpdate) onFilesUpdate(filesAsArray);
  };

  // Function to remove the desired file and update the file list.
  const removeFile = (fileName: string) => {
    delete files[fileName as keyof unknown];
    setFiles({ ...files });
    callUpdateFilesCb({ ...files });
  };

  // Purpose is to loop through all of the existing files being uploaded and render their preview if they are an image.
  const renderImagePreviews = () => {
    return (
      <div className="flex flex-row flex-wrap items-center justify-center gap-3">
        {Object.keys(files).map((fileName, index) => {
          const file: File = files[fileName as keyof object];
          const isImageFile = file.type.split('/')[0] === 'image';
          return (
            <div key={`file-${index}-${file.name}`} className="flex flex-col items-center justify-center gap-2">
              {typeof file}
              <div className="relative bg-gray-200 rounded-xl border border-gray-300 overflow-hidden flex items-center justify-center w-36 h-36">
                {isImageFile && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`file preview ${index}`}
                    className="max-w-xs max-h-40 object-cover"
                  />
                )}
                <div
                  className="absolute right-2 top-2 z-10 cursor-pointer p-1 flex items-center justify-center bg-neutral-100 rounded-full transition-all border-2 border-transparent hover:border-neutral-300"
                  onClick={() => removeFile(fileName)}>
                  <img src={CloseSvg} alt={`Remove ${file.name}`} className="w-5 h-5" />
                </div>
              </div>
              {props.multiple ? (
                <>
                  {/* <span className="text-xs text-neutral-500">{file.name}</span> */}
                  <span className="text-xs text-neutral-500">{convertBytesToKB(file.size)} kb</span>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
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
        {/* Render the image if the mode is single and if the user has already had a file being uploaded */}
        {Object.keys(files).length ? (
          renderImagePreviews()
        ) : (
          <div className="relative flex items-center justify-center">
            <div className="relative z-10 flex items-center justify-center bg-gray-100 rounded-full p-3 border-[6px] border-gray-50">
              <img src={UploadCloudSvg} alt={label} className="w-4 h-4" />
            </div>
            <div
              className={`${
                dragging ? 'animate-ping' : ''
              } absolute bg-gray-50 rounded-full flex items-center justify-center w-12 h-12`}></div>
          </div>
        )}
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
          onChange={handleNewFileUpload}
          {...props}
        />
      </div>
    </div>
  );
};

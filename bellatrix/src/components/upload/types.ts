import { DropzoneOptions } from 'react-dropzone';
// @mui
import { Theme, SxProps } from '@mui/material/styles';

// ----------------------------------------------------------------------

export interface CustomFile extends File {
  path?: string;
  preview?: string;
  lastModifiedDate?: Date;
}

export interface UploadProps extends DropzoneOptions {
  error?: boolean;
  sx?: SxProps<Theme>;
  placeholder?: React.ReactNode;
  helperText?: React.ReactNode;
  originalFileName?: string | null;
  //
  file?: CustomFile | string | null;
  onDelete?: VoidFunction;
}

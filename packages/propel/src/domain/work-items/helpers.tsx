import type { FC } from "react";
import { AudioFileIcon, CodeFileIcon, DocumentFileIcon, ImageFileIcon, VideoFileIcon } from "../../icons/attachments";

const extensionToIconMap: Record<string, FC<{ className?: string }>> = {
  pdf: DocumentFileIcon,
  doc: DocumentFileIcon,
  docx: DocumentFileIcon,
  csv: DocumentFileIcon,
  xls: DocumentFileIcon,
  xlsx: DocumentFileIcon,
  txt: DocumentFileIcon,
  md: DocumentFileIcon,
  jpg: ImageFileIcon,
  jpeg: ImageFileIcon,
  png: ImageFileIcon,
  gif: ImageFileIcon,
  svg: ImageFileIcon,
  webp: ImageFileIcon,
  mp4: VideoFileIcon,
  mov: VideoFileIcon,
  mkv: VideoFileIcon,
  avi: VideoFileIcon,
  mp3: AudioFileIcon,
  wav: AudioFileIcon,
  flac: AudioFileIcon,
  js: CodeFileIcon,
  ts: CodeFileIcon,
  json: CodeFileIcon,
  html: CodeFileIcon,
  css: CodeFileIcon,
  jsx: CodeFileIcon,
  tsx: CodeFileIcon,
};

const DefaultIcon: FC<{ className?: string }> = (props) => <DocumentFileIcon {...props} />;

export const getAttachmentIcon = (extension: string) => {
  const normalizedExtension = extension.toLowerCase();
  return extensionToIconMap[normalizedExtension] ?? DefaultIcon;
};

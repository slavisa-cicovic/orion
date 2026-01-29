import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import Iconify from "./iconify";
import Image from "./image";

type FileLike = File | string;

export function fileData(file: FileLike) {
  const isString = typeof file === "string";
  const name = isString ? (file.split("/").pop() ?? file) : file.name ?? file.path ?? "file";
  const path = isString ? file : file.path ?? name;
  const size = isString ? 0 : file.size ?? 0;
  const key = isString ? file : `${file.name}-${file.size}-${file.lastModified}`;

  return { key, name, path, size };
}

function getFileExt(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function isImageFile(file: FileLike, name: string) {
  if (typeof file !== "string" && file.type) {
    return file.type.startsWith("image/");
  }
  const ext = getFileExt(name);
  return ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext);
}

type Props = {
  file: FileLike;
  imageView?: boolean;
  tooltip?: boolean;
  sx?: object;
  imgSx?: object;
};

export default function FileThumbnail({ file, imageView, tooltip, sx, imgSx }: Props) {
  const { name } = fileData(file);
  const ext = getFileExt(name);
  const showImage = imageView && isImageFile(file, name);

  const src =
    typeof file === "string" ? file : file.preview ?? URL.createObjectURL(file);

  const content = showImage ? (
    <Image alt={name} src={src} sx={{ borderRadius: 1, ...imgSx }} />
  ) : (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.neutral",
        ...sx,
      }}
    >
      <Iconify
        icon={ext === "apk" ? "mdi:android" : ext === "ipa" ? "mdi:apple" : "mdi:file"}
        width={24}
      />
    </Box>
  );

  if (!tooltip) {
    return content;
  }

  return (
    <Tooltip title={<Typography variant="caption">{name}</Typography>}>
      <Box>{content}</Box>
    </Tooltip>
  );
}

import Box, { BoxProps } from "@mui/material/Box";

type Props = BoxProps<"img"> & {
  src?: string;
  alt?: string;
};

export default function Image({ src = "", alt = "", sx, ...other }: Props) {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: 1,
        height: 1,
        objectFit: "cover",
        display: "block",
        ...sx,
      }}
      {...other}
    />
  );
}

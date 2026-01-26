"use client";

import { Box, IconButton, MenuItem, Stack, Typography } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CustomPopover from "@/components/custom-popover/custom-popover";
import usePopover from "@/components/custom-popover/use-popover";

const languages = [
  { code: "en", label: "English" },
  { code: "sr", label: "Serbian" },
  { code: "de", label: "German" }
];

export default function LanguagePopover() {
  const popover = usePopover();

  return (
    <>
      <IconButton onClick={popover.onOpen} aria-label="Language">
        <LanguageIcon />
      </IconButton>
      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="top-right">
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2">Language</Typography>
          <Typography variant="body2" color="text.secondary">
            Select display language
          </Typography>
        </Box>
        <Stack sx={{ px: 1, pb: 1 }}>
          {languages.map((language) => (
            <MenuItem key={language.code} onClick={popover.onClose}>
              {language.label}
            </MenuItem>
          ))}
        </Stack>
      </CustomPopover>
    </>
  );
}

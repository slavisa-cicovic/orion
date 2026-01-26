"use client";

import { AppBar, Box, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountPopover from "./AccountPopover";
import LanguagePopover from "./LanguagePopover";
import NotificationPopover from "./NotificationPopover";

type MainHeaderProps = {
  onOpenNav: VoidFunction;
  navWidth: number;
  headerHeight: number;
};

export default function MainHeader({ onOpenNav, navWidth, headerHeight }: MainHeaderProps) {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        width: { lg: `calc(100% - ${navWidth}px)` },
        ml: { lg: `${navWidth}px` }
      }}
    >
      <Toolbar
        sx={{
          minHeight: headerHeight,
          px: { xs: 2, sm: 3 }
        }}
      >
        <IconButton
          onClick={onOpenNav}
          sx={{ display: { lg: "none" }, mr: 1 }}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Orion Admin
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" alignItems="center" spacing={1}>
          <NotificationPopover />
          <LanguagePopover />
          <AccountPopover />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

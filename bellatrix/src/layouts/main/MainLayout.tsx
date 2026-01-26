"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Box } from "@mui/material";
import MainHeader from "./MainHeader";
import MainSidebar from "./MainSidebar";

const NAV_WIDTH = 280;
const HEADER_HEIGHT = 64;

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [openNav, setOpenNav] = useState(false);

  return (
    <Box sx={{ padding: 2, bgcolor: "background.default" }}>
      <MainHeader
        onOpenNav={() => setOpenNav(true)}
        navWidth={NAV_WIDTH}
        headerHeight={HEADER_HEIGHT}
      />
      <MainSidebar
        open={openNav}
        onClose={() => setOpenNav(false)}
        navWidth={NAV_WIDTH}
        headerHeight={HEADER_HEIGHT}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: `${HEADER_HEIGHT + 24}px`,
          pb: 0,
          px: 0,
          ml: { lg: `${NAV_WIDTH}px` }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

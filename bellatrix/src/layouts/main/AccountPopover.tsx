"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Box, Divider, IconButton, MenuItem, Stack, Typography } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuth } from "@/auth/useAuth";
import CustomPopover from "@/components/custom-popover/custom-popover";
import usePopover from "@/components/custom-popover/use-popover";

export default function AccountPopover() {
  const router = useRouter();
  const { user, roles, logout } = useAuth();
  const popover = usePopover();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setLoading(false);
      popover.onClose();
    }
  };

  return (
    <>
      <IconButton onClick={popover.onOpen} aria-label="Account settings">
        <Avatar sx={{ width: 32, height: 32 }}>
          <AccountCircleIcon fontSize="small" />
        </Avatar>
      </IconButton>
      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="top-right">
        <Box sx={{ p: 2, minWidth: 220 }}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Signed in</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.userId ?? "User"}
            </Typography>
            {roles.length ? (
              <Typography variant="caption" color="text.secondary">
                {roles.join(" · ")}
              </Typography>
            ) : null}
          </Stack>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} disabled={loading} sx={{ px: 2 }}>
          {loading ? "Signing out..." : "Sign out"}
        </MenuItem>
      </CustomPopover>
    </>
  );
}

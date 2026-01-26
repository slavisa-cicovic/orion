"use client";

import { Box, Stack, Typography } from "@mui/material";
import MainLayout from "@/layouts/main/MainLayout";

export default function OverviewView() {
  return (
    <MainLayout>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your Orion admin workspace is ready.
          </Typography>
        </Box>
        <Box
          sx={{
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            p: { xs: 2, sm: 3 },
            bgcolor: "background.paper"
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Next steps
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the navigation to manage apps, versions, approvals, and company access.
          </Typography>
        </Box>
      </Stack>
    </MainLayout>
  );
}

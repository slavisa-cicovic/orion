import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import React, { useCallback } from "react";

export type IDevicesTableFilterValue = string;

export type IDevicesTableFilters = {
  userId: string;
  platform: "" | "ANDROID" | "IOS";
};

type Props = {
  filters: IDevicesTableFilters;
  onFilters: (name: string, value: IDevicesTableFilterValue) => void;
};

export function DevicesTableToolbar({ filters, onFilters }: Props) {
  const handleUserId = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters("userId", event.target.value);
    },
    [onFilters]
  );

  const handlePlatform = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters("platform", event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: "flex-end", md: "center" }}
      direction={{ xs: "column", md: "row" }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 2.5 } }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField fullWidth value={filters.userId} onChange={handleUserId} placeholder="User ID" />
        <TextField
          select
          label="Platform"
          value={filters.platform}
          onChange={handlePlatform}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        >
          <option value="">All</option>
          <option value="ANDROID">Android</option>
          <option value="IOS">iOS</option>
        </TextField>
      </Stack>
    </Stack>
  );
}

import { Chip, Stack } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { IDevicesTableFilters, IDevicesTableFilterValue } from "./devices-table-toolbar";

type Props = {
  filters: IDevicesTableFilters;
  onFilters: (name: string, value: IDevicesTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
  sx?: SxProps<Theme>;
};

export function DevicesTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  sx
}: Props) {
  const chips: Array<{ key: string; label: string; onDelete: VoidFunction }> = [];

  if (filters.userId) {
    chips.push({
      key: "userId",
      label: `User ID: ${filters.userId}`,
      onDelete: () => onFilters("userId", "")
    });
  }
  if (filters.platform) {
    chips.push({
      key: "platform",
      label: `Platform: ${filters.platform}`,
      onDelete: () => onFilters("platform", "")
    });
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={sx}>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onDelete={chip.onDelete} />
      ))}
      <Chip label={`results: ${results}`} variant="outlined" />
      <Chip label="reset" color="primary" onClick={onResetFilters} />
    </Stack>
  );
}

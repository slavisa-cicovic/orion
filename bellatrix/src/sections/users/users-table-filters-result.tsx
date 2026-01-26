import { Chip, Stack } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { IUsersTableFilters, IUsersTableFilterValue } from "./users-table-toolbar";

type Props = {
  filters: IUsersTableFilters;
  onFilters: (name: string, value: IUsersTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
  sx?: SxProps<Theme>;
};

export function UsersTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  sx
}: Props) {
  const chips: Array<{ key: string; label: string; onDelete: VoidFunction }> = [];

  if (filters.search) {
    chips.push({
      key: "search",
      label: `Search: ${filters.search}`,
      onDelete: () => onFilters("search", "")
    });
  }
  if (filters.isActive) {
    chips.push({
      key: "isActive",
      label: `Active: ${filters.isActive === "true" ? "Yes" : "No"}`,
      onDelete: () => onFilters("isActive", "")
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

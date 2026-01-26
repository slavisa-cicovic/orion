import { Chip, Stack } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { IAppsTableFilters, IAppsTableFilterValue } from './apps-table-toolbar';

type Props = {
  filters: IAppsTableFilters;
  onFilters: (name: string, value: IAppsTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
  sx?: SxProps<Theme>;
};

export function AppsTableFiltersResult({ filters, onFilters, onResetFilters, results, sx }: Props) {
  const chips: Array<{ key: string; label: string; onDelete: VoidFunction }> = [];

  if (filters.search) {
    chips.push({
      key: 'search',
      label: `Search: ${filters.search}`,
      onDelete: () => onFilters('search', ''),
    });
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={sx}>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onDelete={chip.onDelete} />
      ))}
      <Chip label={`results: ${results}`} variant="outlined" />
      <Chip label='reset' color="primary" onClick={onResetFilters} />
    </Stack>
  );
}

import Iconify from '@/components/iconify';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import React, { useCallback } from 'react';

export type IAppsTableFilterValue = string;

export type IAppsTableFilters = {
  search: string;
};

type Props = {
  filters: IAppsTableFilters;
  onFilters: (name: string, value: IAppsTableFilterValue) => void;
  showReviewFilter?: boolean;
};

export function AppsTableToolbar({ filters, onFilters }: Props) {
  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('search', event.target.value);
    },
    [onFilters]
  );


  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 2.5 } }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.search}
          onChange={handleSearch}
          placeholder='Search'
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />


      </Stack>
    </Stack>
  );
}

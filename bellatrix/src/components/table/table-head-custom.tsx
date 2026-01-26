import React, { forwardRef } from 'react';
// @mui
import { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import { useTheme } from '@mui/material/styles';


// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

// ----------------------------------------------------------------------

type Props = {
  order?: 'asc' | 'desc';
  orderBy?: string;
  headLabel: Array<{
    id: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    width?: number;
    minWidth?: number;
    disableSort?: boolean;
  }>;
  rowCount?: number;
  numSelected?: number;
  onSort?: (id: string) => void;
  onSelectAllRows?: (checked: boolean) => void;
  sx?: SxProps<Theme>;
};

const TableHeadCustom = forwardRef<HTMLTableSectionElement, Props>(({
  order,
  orderBy,
  rowCount = 0,
  headLabel,
  numSelected = 0,
  onSort,
  onSelectAllRows,
  sx,
}: Props) => {


  const theme = useTheme();

  return (
    <TableHead sx={{
      backgroundColor: theme.palette.grey[100],
      ...sx
    }}>
      <TableRow sx={{ height: 44 }}>
        {onSelectAllRows && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={!!numSelected && numSelected < rowCount}
              checked={!!rowCount && numSelected === rowCount}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onSelectAllRows(event.target.checked)
              }
            />
          </TableCell>
        )}

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth, py: 0.75 }}
          >
            {onSort && !headCell.disableSort ? (
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => onSort(headCell.id)}
                sx={{ width: 1 }}
                IconComponent={() => (
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    {orderBy === headCell.id && (
                      <Box component="span" sx={{ ...visuallyHidden }}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    )}
                    <Box component="span" sx={{ marginLeft: 'auto' }}>
                      <TableSortLabel direction={orderBy === headCell.id ? order : 'asc'} />
                    </Box>
                  </Box>
                )}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {headCell.label}
                </Box>
              </TableSortLabel>
            ) : (
              (headCell.label)
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
})

export default TableHeadCustom;

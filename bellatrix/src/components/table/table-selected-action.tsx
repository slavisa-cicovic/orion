import React from 'react';
// @mui
import Checkbox from '@mui/material/Checkbox';
import Stack, { StackProps } from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export type TableSelectedActionItem = {
  key: string;
  node: React.ReactNode;
};

interface Props extends StackProps {
  dense?: boolean;
  actions?: TableSelectedActionItem[];
  rowCount: number;
  numSelected: number;
  onSelectAllRows: (checked: boolean) => void;
}

export default function TableSelectedAction({
  dense,
  actions,
  rowCount,
  numSelected,
  onSelectAllRows,
  sx,
  ...other
}: Props) {

  if (!numSelected) {
    return null;
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        pl: 0.5,
        top: 0,
        left: 0,
         width: 1,
        zIndex: 9,
        height: 44,
        position: 'absolute',
        bgcolor: 'primary.lighter',
        ...sx,
      }}
      {...other}
    >
      <Checkbox
        indeterminate={!!numSelected && numSelected < rowCount}
        checked={!!rowCount && numSelected === rowCount}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onSelectAllRows(event.target.checked)
        }
      />

      <Typography
        variant="subtitle2"
        sx={{
          ml: 2,
          flexGrow: 1,
          color: 'primary.main',
          ...(dense && {
            ml: 3,
          }),
        }}
      >
        {numSelected} selected 
      </Typography>

      {actions?.map((action) => (
        <React.Fragment key={action.key}>{action.node}</React.Fragment>
      ))}
    </Stack>
  );
}

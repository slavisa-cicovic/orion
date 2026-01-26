// @mui
import { Theme, SxProps } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import TablePagination, { TablePaginationProps } from '@mui/material/TablePagination';
// ----------------------------------------------------------------------

type Props = {
  denseVisible?: boolean;
  dense?: boolean;
  onChangeDense?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  note?: string;
  sx?: SxProps<Theme>;
};

export default function TablePaginationCustom({
                                                denseVisible,
                                                dense,
                                                onChangeDense,
                                                rowsPerPageOptions = [5, 10, 25, 50, 100],
                                                note,
                                                sx,
                                                ...other
                                              }: Props & TablePaginationProps) {

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
        <Typography variant="body2" color="textSecondary" sx={{ width: 1 }}>
          {note}
        </Typography>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          {...other}
          sx={{
            borderTopColor: 'transparent',
            width: 0.9,
          }}
        />
      </Box>
      {denseVisible && onChangeDense && (
        <FormControlLabel
          label='dense'
          control={<Switch checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: {
              sm: 'absolute',
            },
          }}
        />
      )}
    </Box>
  );
}

// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { fData } from 'src/utils/format-number';
//
import Iconify from '../iconify';
import Image from '../image';

// ----------------------------------------------------------------------

type Props = {
  imgUrl?: string;
  originalFileName?: string | null;
  file?: File | string | null;
};

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];

function getName(file?: File | string | null) {
  if (!file) return 'file';
  if (typeof file === 'string') return file.split('/').pop() ?? 'file';
  return file.name ?? 'file';
}

function getExt(name: string) {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

function isImage(file?: File | string | null, imgUrl?: string) {
  if (file && typeof file !== 'string' && file.type) {
    return file.type.startsWith('image/');
  }
  const name = getName(file);
  const ext = getExt(name);
  if (IMAGE_EXTS.includes(ext)) return true;
  return !!imgUrl && IMAGE_EXTS.some((e) => imgUrl.toLowerCase().includes(`.${e}`));
}

export default function SingleFilePreview({ imgUrl = '', originalFileName = null, file = null }: Props) {
  const name = originalFileName || getName(file);
  const ext = getExt(name);
  const size = file && typeof file !== 'string' ? file.size : 0;

  const src = imgUrl || (typeof file === 'string' ? file : '') || '';

  const showImage = isImage(file, imgUrl) && !!src;

  return (
    <Box
      sx={{
        p: 1,
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        position: 'absolute',
      }}
    >
      {showImage ? (
        <Image
          alt="file preview"
          src={src}
          sx={{
            width: 1,
            height: 1,
            borderRadius: 1,
          }}
        />
      ) : (
        <Stack
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ width: 1, height: 1 }}
        >
          <Iconify
            icon={ext === 'apk' ? 'mdi:android' : ext === 'ipa' ? 'mdi:apple' : 'mdi:file'}
            width={48}
          />
          <Typography variant="body2" sx={{ px: 2 }} noWrap>
            {name}
          </Typography>
          {!!size && (
            <Typography variant="caption" color="text.secondary">
              {fData(size)}
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}

import { usePathname } from 'next/navigation';

// ----------------------------------------------------------------------

type ReturnType = boolean;

export function useActiveLink(path: string, deep = true): ReturnType {
  const pathname = usePathname();

  const checkPath = path.startsWith('#');

  const normalize = (value: string) => (value === '/' ? '/' : value.replace(/\/+$/, ''));
  const normalizedPathname = normalize(pathname || '/');
  const currentPath = normalize(path);
  const currentPathWithSlash = currentPath === '/' ? '/' : `${currentPath}/`;

  const normalActive = !checkPath && normalizedPathname === currentPath;

  const deepActive =
    !checkPath &&
    (normalizedPathname === currentPath ||
      (currentPath !== '/' && normalizedPathname.startsWith(currentPathWithSlash)));

  return deep ? deepActive : normalActive;
}

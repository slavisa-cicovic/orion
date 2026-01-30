import { forwardRef } from 'react';
import type { PropsWithChildren } from 'react';
import Link, { LinkProps } from 'next/link';

// ----------------------------------------------------------------------

type Props = PropsWithChildren<LinkProps>;

const RouterLink = forwardRef<HTMLAnchorElement, Props>(({ children, ...other }, ref) => (
  <Link ref={ref} {...other}>
    {children}
  </Link>
));

export default RouterLink;

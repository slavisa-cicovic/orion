"use client";

import { useAuth } from "@/auth/useAuth";
import AppsIcon from "@mui/icons-material/Apps";
import BusinessIcon from "@mui/icons-material/Business";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DevicesIcon from "@mui/icons-material/Devices";
import PeopleIcon from "@mui/icons-material/People";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: <DashboardIcon /> },
  {
    label: "Companies",
    href: "/dashboard/companies",
    icon: <BusinessIcon />,
    roles: ["SUPER_ADMIN"]
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: <PeopleIcon />,
    roles: ["SUPER_ADMIN"]
  },
  {
    label: "Apps",
    href: "/dashboard/apps",
    icon: <AppsIcon />,
    roles: ["SUPER_ADMIN"]
  },
  {
    label: "Devices",
    href: "/dashboard/devices",
    icon: <DevicesIcon />,
    roles: ["SUPER_ADMIN"]
  },  
];

type MainSidebarProps = {
  open: boolean;
  onClose: VoidFunction;
  navWidth: number;
  headerHeight: number;
};

type NavItem = (typeof navItems)[number] & {
  permissions?: string[];
  roles?: string[];
};

export default function MainSidebar({ open, onClose, navWidth, headerHeight }: MainSidebarProps) {
  const pathname = usePathname();
  const { roles, hasPermission } = useAuth();

  const visibleItems = navItems.filter((item) => {
    const typedItem = item as NavItem;
    const roleMatch = !typedItem.roles || typedItem.roles.some((role) => roles.includes(role));
    const permissionMatch =
      !typedItem.permissions || typedItem.permissions.some((permission) => hasPermission(permission));

    return roleMatch && permissionMatch;
  });

  const content = (
    <Stack sx={{ height: "100%" }}>
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Orion
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Internal app distribution
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {visibleItems.map((item) => (
          <ListItemButton
            key={item.label}
            component={Link}
            href={item.href}
            selected={pathname === item.href}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              px: 1.5
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: pathname === item.href ? 600 : 500 }}
            />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Admin portal v0.1
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Box component="nav" sx={{ width: { lg: navWidth }, flexShrink: { lg: 0 } }}>
      <Drawer
        open={open}
        onClose={onClose}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: navWidth
          }
        }}
        sx={{ display: { xs: "block", lg: "none" } }}
      >
        {content}
      </Drawer>
      <Drawer
        open
        variant="permanent"
        PaperProps={{
          sx: {
            width: navWidth,
            borderRightStyle: "solid",
            borderRightWidth: 1,
            borderColor: "divider",
            pt: `${headerHeight}px`
          }
        }}
        sx={{ display: { xs: "none", lg: "block" } }}
      >
        {content}
      </Drawer>
    </Box>
  );
}

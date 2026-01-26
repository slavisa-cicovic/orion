"use client";

import {
  Badge,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CustomPopover from "@/components/custom-popover/custom-popover";
import usePopover from "@/components/custom-popover/use-popover";

const notifications = [
  {
    id: "release",
    title: "New version pending",
    description: "App Alpha 1.2.0 awaits approval."
  },
  {
    id: "company",
    title: "Company request",
    description: "NovaTek requested access to App Beta."
  },
  {
    id: "policy",
    title: "Policy update",
    description: "Review updated release checklist."
  }
];

export default function NotificationPopover() {
  const popover = usePopover();
  const unreadCount = notifications.length;

  return (
    <>
      <IconButton onClick={popover.onOpen} aria-label="Notifications">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>
      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="top-right">
        <Box sx={{ p: 2, minWidth: 280 }}>
          <Typography variant="subtitle2">Notifications</Typography>
          <Typography variant="body2" color="text.secondary">
            You have {unreadCount} unread updates
          </Typography>
        </Box>
        <List sx={{ p: 0, maxHeight: 280, overflow: "auto" }}>
          {notifications.map((item) => (
            <ListItem key={item.id} sx={{ px: 2, py: 1 }}>
              <ListItemText
                primary={item.title}
                secondary={item.description}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>
          ))}
        </List>
      </CustomPopover>
    </>
  );
}

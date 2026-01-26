export type Device = {
  id: string;
  userId: string;
  userFullName: string | null;
  deviceId: string;
  platform: "ANDROID" | "IOS";
  model: string | null;
  osVersion: string | null;
  createdAt: string;
};

export type DeviceListResponse = Device[];

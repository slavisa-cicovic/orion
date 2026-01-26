import { Device } from "@/api/types/devices";
import { DeviceRow } from "@/sections/devices/types";
import { formatDate } from "@/api/mappings/formatters";

export function mapDeviceToRow(device: Device): DeviceRow {
  return {
    id: device.id,
    userFullName: device.userFullName ?? "-",
    deviceId: device.deviceId,
    platform: device.platform,
    model: device.model ?? "-",
    osVersion: device.osVersion ?? "-",
    createdAt: formatDate(device.createdAt)
  };
}

export function mapDevicesToRows(devices: Device[]): DeviceRow[] {
  return devices.map(mapDeviceToRow);
}

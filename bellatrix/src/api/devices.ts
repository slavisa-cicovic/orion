import { useMemo } from "react";
import useSWR from "swr";
import { endpoints, fetcher } from "@/utils/axios";
import { DeviceListResponse } from "@/api/types/devices";
import { mapDevicesToRows } from "@/api/mappings/devices";

type DevicesQuery = {
  userId: string | null;
  platform?: "ANDROID" | "IOS";
};

export function useGetDevices(params: DevicesQuery) {
  const query = new URLSearchParams();
  if (params.platform) query.set("platform", params.platform);
  if (params.userId) query.set("userId", params.userId);

  const url = params.userId ? `${endpoints.devices.list}?${query.toString()}` : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR<DeviceListResponse>(url, fetcher);

  return useMemo(
    () => ({
      devices: data ?? [],
      deviceRows: mapDevicesToRows(data ?? []),
      total: data?.length ?? 0,
      devicesLoading: isLoading,
      devicesError: error,
      devicesValidating: isValidating,
      devicesEmpty: !isLoading && !data?.length,
      mutate
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

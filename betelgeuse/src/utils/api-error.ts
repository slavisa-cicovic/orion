export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  const e = error as {
    response?: { data?: { reason?: string; message?: string } };
    message?: string;
  };

  return (
    e?.response?.data?.reason ||
    e?.response?.data?.message ||
    e?.message ||
    fallback
  );
}

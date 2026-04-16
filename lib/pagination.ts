/** Shared catalog pagination — also re-exported from `yacht-catalog-utils` for compatibility. */
export function paginateSlice<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
) {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { slice, pageCount, safePage, total };
}

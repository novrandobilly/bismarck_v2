export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

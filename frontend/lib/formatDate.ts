export const formatDate = (iso: string): string => {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(iso));
};

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are zero-indexed
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Example usage
// const date = new Date();
// const formattedDate = formatDate(date);
// console.log(formattedDate); // Outputs something like "2025-01-13"

export const pathJoin = (path: string, subPath: string) => {
  return (
    "/" +
    path
      .split("/")
      .concat(subPath.split("/"))
      .filter((p) => p)
      .join("/")
  );
};

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };

  return new Date(date).toLocaleDateString("en-DE", options);
}

function removeDiacritics(string: string) {
  return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function titleToSlug(string: string) {
  // Remove diacritics
  let stringWithoutDiacritics = removeDiacritics(string);

  // Remove special characters and replace spaces with hyphens
  let simplifiedString = stringWithoutDiacritics
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-");
  return simplifiedString;
}

// eslint-disable-next-line prettier/prettier
export const snakeToKebab = (s: string) => s.replaceAll("_", "-");

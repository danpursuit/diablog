import numeral from "numeral";

// for numeral formatting with nan validation
export const formatNumber = (num: number, formatString: string): string => {
  // formatString is like "0,0.0[000000]"
  const formattedNumber = numeral(num).format(formatString);
  if (formattedNumber.toLowerCase() === "nan") return "0";
  return formattedNumber;
};

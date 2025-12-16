import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type PaymentImageURL = {
  bankCode: string;
  destinationAccount: string;
  amount: number;
  description?: string;
  accountName?: string;
  template?: string;
};

export function getPaymentImageURL({
  bankCode,
  destinationAccount,
  amount,
  description = "",
  accountName = "",
  template = "compact2",
}: PaymentImageURL): string {
  const baseUrl = "https://img.vietqr.io/image";
  const params = new URLSearchParams();

  if (amount > 0) {
    params.append("amount", amount.toString());
  } else {
    throw new Error("Amount must be greater than 0");
  }

  if (description) {
    params.append("addInfo", description);
  }

  if (accountName) {
    params.append("accountName", accountName);
  }

  const queryString = params.toString();
  const url = `${baseUrl}/${bankCode}-${destinationAccount}-${template}.png`;

  return queryString ? `${url}?${queryString}` : url;
}

import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Get locale from cookies or default to 'en'
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "vi";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

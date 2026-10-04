import { createContext, useContext } from "react";
import { translate, type Language } from "./translate";
export const LanguageContext = createContext<Language>("tr");
export function useTranslation() {
  const language = useContext(LanguageContext);
  return {
    language,
    tx: (text: string | undefined, values?: Record<string, string>) =>
      translate(text, language, values),
  };
}

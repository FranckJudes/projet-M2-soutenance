import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./lang/en.json";
import fr from "./lang/fr.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr }
    },
    lng: "fr", // default language
    interpolation: { escapeValue: false }
  });

export default i18n;

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-xhr-backend";
import { initReactI18next } from "react-i18next";

const fallbackLng = ["en-US"];
const availableLanguages = ["ru", "en-US"];

i18n
	.use(Backend) // load translations using http (default                                               public/assets/locals/en/translations)
	.use(LanguageDetector) // detect user language
	.use(initReactI18next) // pass the i18n instance to react-i18next.
	.init({
		fallbackLng, // fallback language is english.

		detection: {
			checkWhitelist: true, // options for language detection
		},

		debug: false,
		backend: {
			/* translation file path */

			loadPath: "/translations/{{lng}}.json",
		},

		whitelist: availableLanguages,

		interpolation: {
			escapeValue: false, // no need for react. it escapes by default
		},
	});

export default i18n;

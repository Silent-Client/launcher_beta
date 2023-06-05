import { ChakraProvider } from "@chakra-ui/react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./css/theme.css";
import "./i18n";
import AppProvider from "./providers/AppContext";
import reportWebVitals from "./reportWebVitals";
import theme from "./theme";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);
root.render(
	<ChakraProvider theme={theme}>
		<HashRouter>
			<AppProvider>
				<App />
			</AppProvider>
		</HashRouter>
	</ChakraProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

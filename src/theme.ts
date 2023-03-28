import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
	fonts: {
		heading: `'Onest Bold', sans-serif`,
		body: `'Onest Regular', sans-serif`,
	},
	styles: {
		global: {
			body: {
				color: "white",
				backgroundColor: "black",
			},
		},
	},
	config: {
		initialColorMode: "dark",
		useSystemColorMode: false,
		cssVarPrefix: "silentclient",
	},
	colors: {
		green: {
			"50": "#ECF9EE",
			"100": "#C9EED0",
			"200": "#A5E3B1",
			"300": "#82D893",
			"400": "#5FCD74",
			"500": "#3CC356",
			"600": "#309C45",
			"700": "#247534",
			"800": "#184E22",
			"900": "#0C2711",
		},
	},
});

export default theme;

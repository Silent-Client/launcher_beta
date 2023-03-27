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
			50: "#e2fdec",
			100: "#bbf4d0",
			200: "#93eab2",
			300: "#69e295",
			400: "#41da78",
			500: "#29c15e",
			600: "#1d9648",
			700: "#126b33",
			800: "#05401d",
			900: "#001704",
		},
	},
});

export default theme;

import axios from "axios";

export default function version() {
	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());

	return params.v || "unknown";
}

export function isDebug() {
	return version() === "debug";
}

export async function getCurrentVersion() {
	const { data: res } = await axios.get(
		"https://api.silentclient.net/releases/launcher.json"
	);

	return res.version;
}

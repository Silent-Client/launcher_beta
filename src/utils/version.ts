import axios from "axios";

export default function version() {
	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());

	return params.v || "unknown";
}

export async function getVersionIndex() {
	const { data: indexes } = await axios.get(
		"https://api.github.com/repos/Silent-Client/launcher-releases/releases"
	);

	if (isDebug()) {
		return indexes.length + 1;
	}

	if (version() === "unknown") {
		return 0;
	}

	let index: number = 0;
	let forIndex: number = 1;

	for (const release of indexes) {
		if (release.tag_name === version()) {
			index = forIndex;
		}
		forIndex++;
	}

	return index;
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

import Settings from "../types/Settings";

const Store = window.localStorage;

export function setSettings(object: Settings) {
	Store.setItem("settings", JSON.stringify(object));
}

export function getSettings() {
	const settings = Store.getItem("settings");
	if (settings) {
		return JSON.parse(settings) as Settings;
	} else {
		return {
			memory: 2,
			branch: "stable",
			version: "1.8",
			jarPath: null,
			minecraftPath: "",
			width: 1280,
			height: 720,
			discord: false,
			afterLaunch: "hide",
			preLoadCosmetics: true,
			testBranch: "test",
		} as Settings;
	}
}

export default interface Settings {
	memory: number;
	branch: "stable" | "experimental" | "test" | "custom";
	version: "1.8" | "1.12";
	jarPath: string | null;
	minecraftPath: string;
	width: number;
	height: number;
	discord: boolean;
	afterLaunch: "hide" | "show";
	preLoadCosmetics: boolean;
}

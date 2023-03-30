export default interface Settings {
	memory: number;
	branch: "stable" | "experimental" | "test";
	jarPath: string | null;
	minecraftPath: string;
	width: number;
	height: number;
	discord: boolean;
	afterLaunch: "hide" | "show";
}

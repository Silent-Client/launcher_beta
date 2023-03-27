export default interface Settings {
	memory: number;
	branch: "stable" | "experimental";
	width: number;
	height: number;
	discord: boolean;
	afterLaunch: "hide" | "show";
}

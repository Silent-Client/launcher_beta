export default interface Settings {
	memory: number;
	branch: string;
	version: "1.8" | "1.12";
	jarPath: string | null;
	minecraftPath: string;
	width: number;
	height: number;
	discord: boolean;
	afterLaunch: "hide" | "show";
	preLoadCosmetics: boolean;
	testBranch: string;
	customJavaPath: string | null;
	sc2: boolean;
	optifine: boolean;
}

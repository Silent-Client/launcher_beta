export default interface Settings {
	memory: number;
	branch: string;
	version: string;
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

import {
	Container,
	Heading,
	Input,
	Link,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	Stack,
	Switch,
	Tooltip,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getSettings, setSettings } from "../hooks/SettingsManager";

function Settings({
	ram,
	versionIndex,
}: {
	ram: number;
	versionIndex: number;
}) {
	let ipcRenderer: any = null;
	try {
		ipcRenderer = window.require("electron").ipcRenderer;
	} catch (error) {
		console.error(error);
	}
	const { t, i18n } = useTranslation();

	const settings = getSettings();

	const [memory, setMemory] = useState(settings.memory);
	const [width, setWidth] = useState(settings.width);
	const [height, setHeight] = useState(settings.height);
	const [discord, setDiscord] = useState(settings.discord);
	const [preLoadCosmetics, setPreLoadCosmetics] = useState(
		settings.preLoadCosmetics
	);
	const [path, setPath] = useState(settings.minecraftPath);

	const [showTooltip, setShowTooltip] = useState(false);

	ipcRenderer?.on(
		"settings/customPath",
		function (evt: any, message: { path: string }) {
			setPath(message.path);
			setSettings({
				branch: settings.branch,
				jarPath: settings.jarPath,
				minecraftPath: message.path,
				width: width,
				height: height,
				memory: memory,
				discord: discord,
				afterLaunch: "hide",
				preLoadCosmetics,
			});
		}
	);

	return (
		<Container maxW="full" minW="full">
			<Heading w="full">{t("settings.title")}</Heading>
			<Stack mt={5} direction={"column"} spacing={5}>
				{versionIndex > 1 && (
					<Stack
						direction={"row"}
						justifyContent="space-between"
						w="full"
						spacing={1}
					>
						<Heading size={"sm"}>{t("settings.path")}</Heading>
						<Input
							size={"sm"}
							placeholder="Path"
							value={path}
							readOnly
							onClick={() =>
								ipcRenderer.send("app/getCustomPath", {
									defaultPath: getSettings().minecraftPath,
								})
							}
						/>
					</Stack>
				)}
				<Stack
					direction={"row"}
					justifyContent="space-between"
					w="full"
					spacing={1}
				>
					<Heading size={"sm"}>{t("settings.ram")}</Heading>
					<Slider
						colorScheme="whiteAlpha"
						onChange={mem => {
							setMemory(mem);
							setSettings({
								branch: settings.branch,
								jarPath: settings.jarPath,
								minecraftPath: path,
								width: width,
								height: height,
								memory: mem,
								discord: discord,
								afterLaunch: "hide",
								preLoadCosmetics,
							});
						}}
						max={ram - (versionIndex > 2 ? 2000 : 2)}
						min={versionIndex > 2 ? 1000 : 1}
						value={memory}
						onMouseEnter={() => setShowTooltip(true)}
						onMouseLeave={() => setShowTooltip(false)}
					>
						<SliderTrack>
							<SliderFilledTrack />
						</SliderTrack>
						<Tooltip
							hasArrow
							colorScheme={"blackAlpha"}
							placement="top"
							isOpen={showTooltip}
							label={`${memory} ${versionIndex > 2 ? "MB" : "GB"}`}
						>
							<SliderThumb />
						</Tooltip>
					</Slider>
				</Stack>
				<Stack
					direction={"row"}
					justifyContent="space-between"
					w="full"
					spacing={1}
				>
					<Heading size={"sm"}>{t("settings.width")}</Heading>
					<Input
						size={"sm"}
						type="number"
						placeholder="Width"
						value={width}
						onChange={e => {
							setWidth(e.target.valueAsNumber);
							setSettings({
								branch: settings.branch,
								jarPath: settings.jarPath,
								minecraftPath: path,
								width: e.target.valueAsNumber,
								height: height,
								memory: memory,
								discord: discord,
								afterLaunch: "hide",
								preLoadCosmetics,
							});
						}}
					/>
				</Stack>
				<Stack
					direction={"row"}
					justifyContent="space-between"
					w="full"
					spacing={1}
				>
					<Heading size={"sm"}>{t("settings.height")}</Heading>
					<Input
						size={"sm"}
						type="number"
						placeholder="Height"
						value={height}
						onChange={e => {
							setHeight(e.target.valueAsNumber);
							setSettings({
								branch: settings.branch,
								jarPath: settings.jarPath,
								minecraftPath: path,
								width: width,
								height: e.target.valueAsNumber,
								memory: memory,
								discord: discord,
								afterLaunch: "hide",
								preLoadCosmetics,
							});
						}}
					/>
				</Stack>
				<Stack
					direction={"row"}
					justifyContent="space-between"
					w="full"
					spacing={1}
				>
					<Heading size={"sm"}>Discord RPC</Heading>
					<Switch
						colorScheme={"green"}
						isChecked={discord}
						onChange={() => {
							setSettings({
								branch: settings.branch,
								jarPath: settings.jarPath,
								minecraftPath: path,
								width: width,
								height: height,
								memory: memory,
								discord: !discord,
								afterLaunch: "hide",
								preLoadCosmetics,
							});
							setDiscord(!discord);
						}}
					/>
				</Stack>
				<Stack
					direction={"row"}
					justifyContent="space-between"
					w="full"
					spacing={1}
				>
					<Heading size={"sm"}>{t("settings.language")}</Heading>
					<Link
						onClick={() =>
							i18n.changeLanguage(i18n.language === "en-US" ? "ru" : "en-US")
						}
					>
						{i18n.language === "en-US"
							? "Перейти на русский язык"
							: "Switch to English"}
					</Link>
				</Stack>
				{versionIndex > 2 && (
					<Stack
						direction={"row"}
						justifyContent="space-between"
						w="full"
						spacing={1}
					>
						<Tooltip label={t("settings.preLoadCosmetics.tooltip")}>
							<Heading size={"sm"}>
								{t("settings.preLoadCosmetics.title")}
							</Heading>
						</Tooltip>
						<Switch
							colorScheme={"green"}
							isChecked={preLoadCosmetics}
							onChange={e => {
								setSettings({
									branch: settings.branch,
									jarPath: settings.jarPath,
									minecraftPath: path,
									width: width,
									height: height,
									memory: memory,
									discord: discord,
									afterLaunch: "hide",
									preLoadCosmetics: !preLoadCosmetics,
								});
								setPreLoadCosmetics(!preLoadCosmetics);
							}}
						/>
					</Stack>
				)}
			</Stack>
		</Container>
	);
}

export default Settings;
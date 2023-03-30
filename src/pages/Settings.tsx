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
	const { t, i18n } = useTranslation();

	const settings = getSettings();

	const [memory, setMemory] = useState(settings.memory);
	const [width, setWidth] = useState(settings.width);
	const [height, setHeight] = useState(settings.height);
	const [discord, setDiscord] = useState(settings.discord);
	const [path, setPath] = useState(settings.minecraftPath);

	const [showTooltip, setShowTooltip] = useState(false);

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
						<Heading size={"sm"}>Minecraft Path</Heading>
						<Input
							size={"sm"}
							placeholder="Path"
							value={path}
							readOnly
							onClick={() => {
								window
									.require("electron")
									.remote.dialog.showOpenDialog({
										defaultPath: path,
										properties: ["openDirectory"],
									})
									.then(function (response: any) {
										if (!response.canceled) {
											console.log(response);
										} else {
										}
									});
							}}
							// onChange={e => {
							// 	setWidth(e.target.valueAsNumber);
							// 	setSettings({
							// 		branch: settings.branch,
							// 		jarPath: settings.jarPath,
							// 		minecraftPath: path,
							// 		width: e.target.valueAsNumber,
							// 		height: height,
							// 		memory: memory,
							// 		discord: discord,
							// 		afterLaunch: "hide",
							// 	});
							// }}
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
							});
						}}
						max={ram - 2}
						min={1}
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
							label={`${memory} GB`}
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
						onChange={e => {
							setSettings({
								branch: settings.branch,
								jarPath: settings.jarPath,
								minecraftPath: path,
								width: width,
								height: height,
								memory: memory,
								discord: !discord,
								afterLaunch: "hide",
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
			</Stack>
		</Container>
	);
}

export default Settings;

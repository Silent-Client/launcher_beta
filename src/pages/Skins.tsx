import {
	Box,
	Button,
	Center,
	Container,
	FormControl,
	FormLabel,
	Heading,
	Select,
	Stack,
	Switch,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import FilePicker from "chakra-ui-file-picker";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SkinViewer } from "skinview3d";
import { getUser, updateAuth } from "../hooks/AuthManager";

function Skins() {
	const [enabled, setEnabled] = useState<boolean>(getUser()?.custom_skin === 1);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [texture, setTexture] = useState<File | null>(null);
	const [type, setType] = useState<"default" | "slim">(
		getUser()?.skin_type || "default"
	);
	const { t } = useTranslation();
	const toast = useToast();

	const changeTexture = async (
		type: "default" | "slim",
		texture?: File | null
	) => {
		try {
			const preview = document.getElementById("preview");
			if (!preview) {
				return;
			}
			const skinViewer = new SkinViewer({
				width: 300,
				height: 400,
				canvas: preview as HTMLCanvasElement,
				zoom: 0.8,
			});
			skinViewer.controls.enableZoom = false;
			if (!texture) {
				try {
					await Promise.all([
						skinViewer.loadSkin(
							`https://843931.selcdn.ru/cosmetics/skins/${
								getUser()?.username
							}.png`,
							{
								model: type,
							}
						),
					]);
				} catch {
					await Promise.all([
						skinViewer.loadSkin("https://mc-heads.net/skin/MHF_Steve", {
							model: type,
						}),
					]);
				}
			} else {
				try {
					await Promise.all([
						skinViewer.loadSkin(URL.createObjectURL(texture), {
							model: type,
						}),
					]);
				} catch {
					toast({
						title: t("skins.errors.title"),
						description: t("skins.errors.file_error"),
						status: "error",
						duration: 3000,
						isClosable: true,
					});
					try {
						await Promise.all([
							skinViewer.loadSkin(
								`https://843931.selcdn.ru/cosmetics/skins/${
									getUser()?.username
								}.png`,
								{
									model: type,
								}
							),
						]);
					} catch {
						await Promise.all([
							skinViewer.loadSkin("https://mc-heads.net/skin/MHF_Steve", {
								model: type,
							}),
						]);
					}
					return;
				}
			}
		} catch {
			return;
		}
	};

	useEffect(() => {
		const func = async () => {
			setTexture(null);
			await changeTexture(type);
		};

		func();
	}, [enabled]);

	const navigate = useNavigate();

	return (
		<Container maxW="full" minW="full">
			<Stack direction={"row"} justifyContent="space-between">
				<Heading>{t("skins.title")}</Heading>
				<Switch
					isChecked={enabled}
					onChange={async e => {
						setEnabled(e.target.checked);
						try {
							await axios.post(
								"https://api.silentclient.net/skins/set",
								{
									enabled: e.target.checked,
									type: getUser()?.skin_type,
								},
								{
									headers: {
										authorization: `Bearer ${getUser()?.accessToken}`,
									},
								}
							);
							const auth = await updateAuth();
							if (auth.error === 1) {
								navigate(`/change_username/${auth.username}`);
								return;
							}
						} catch (err: any) {
							if (
								err?.response &&
								err.response?.data &&
								err.response.data?.errors
							) {
								for (const error of err.response.data.errors) {
									toast({
										title: t("skins.errors.title"),
										description: error.message,
										status: "error",
										duration: 3000,
										isClosable: true,
									});
								}
							}
						}
					}}
					size={"lg"}
					colorScheme="green"
				/>
			</Stack>
			{enabled && (
				<Box id="edit_skin" mt={5}>
					<Stack direction={"row"} justifyContent="space-between">
						<Stack
							direction={"column"}
							spacing={3}
							bgColor={"rgb(19, 19, 19)"}
							boxShadow="rgba(0, 0, 0, 0.1) 0px 15px 9px 0px"
							borderRadius={"lg"}
							padding={3}
							minW="300px"
							maxW="300px"
						>
							<Center>
								<Heading size={"md"}>{t("skins.your_skin")}</Heading>
							</Center>
							<Center>
								<canvas height={"400px"} id="preview" />
							</Center>
						</Stack>
						<Stack
							direction={"column"}
							spacing={3}
							padding={3}
							minW="400px"
							maxW="400px"
						>
							<Center>
								<Heading size={"md"}>{t("skins.edit.title")}</Heading>
							</Center>
							<Center>
								<FormControl>
									<FormLabel>{t("skins.edit.texture")}</FormLabel>
									<FilePicker
										onFileChange={async files => {
											setTexture(files[0]);
											await changeTexture(type, files[0]);
										}}
										placeholder={".png"}
										clearButtonLabel="label"
										multipleFiles={false}
										hideClearButton={true}
									/>
								</FormControl>
							</Center>
							<Center>
								<FormControl onBlur={() => changeTexture(type, texture)}>
									<FormLabel>{t("skins.edit.type")}</FormLabel>
									<Select
										value={type}
										onChange={async e => {
											try {
												setType(e.currentTarget.value as "default" | "slim");
												setIsLoading(true);
												await axios.post(
													"https://api.silentclient.net/skins/set",
													{
														enabled: enabled,
														type: e.currentTarget.value,
													},
													{
														headers: {
															authorization: `Bearer ${getUser()?.accessToken}`,
														},
													}
												);
												const auth = await updateAuth();
												if (auth.error === 1) {
													navigate(`/change_username/${auth.username}`);
													return;
												}
											} catch (err: any) {
												if (
													err?.response &&
													err.response?.data &&
													err.response.data?.errors
												) {
													for (const error of err.response.data.errors) {
														toast({
															title: t("skins.errors.title"),
															description: error.message,
															status: "error",
															duration: 3000,
															isClosable: true,
														});
													}
												}
											} finally {
												setIsLoading(false);
											}
										}}
									>
										<option value={"default"}>Default</option>
										<option value={"slim"}>Slim</option>
									</Select>
								</FormControl>
							</Center>
							<Center w="full">
								<Button
									w="full"
									isDisabled={isLoading}
									onClick={async () => {
										setIsLoading(true);
										try {
											const data = new FormData();
											data.append("enabled", enabled ? "1" : "0");
											data.append("texture", texture || "");
											data.append("type", type);
											await axios.post(
												"https://api.silentclient.net/skins/set",
												data,
												{
													headers: {
														authorization: `Bearer ${getUser()?.accessToken}`,
													},
												}
											);

											toast({
												title: t("skins.success.title"),
												description: t("skins.success.description"),
												status: "success",
												duration: 6000,
												isClosable: true,
											});
										} catch (err: any) {
											if (
												err?.response &&
												err.response?.data &&
												err.response.data?.errors
											) {
												for (const error of err.response.data.errors) {
													toast({
														title: t("skins.errors.title"),
														description: error.message,
														status: "error",
														duration: 3000,
														isClosable: true,
													});
												}
											}
										} finally {
											setIsLoading(false);
										}
									}}
								>
									{t("skins.edit.save")}
								</Button>
							</Center>
						</Stack>
					</Stack>
				</Box>
			)}
		</Container>
	);
}

export default Skins;

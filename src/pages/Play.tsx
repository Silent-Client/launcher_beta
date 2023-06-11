import {
	AddIcon,
	ChevronDownIcon,
	CloseIcon,
	EditIcon,
	SettingsIcon,
} from "@chakra-ui/icons";
import {
	Box,
	Button,
	Center,
	Container,
	Heading,
	IconButton,
	Image,
	Link,
	Menu,
	MenuButton,
	MenuGroup,
	MenuItem,
	MenuList,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Progress,
	SimpleGrid,
	Spinner,
	Stack,
	Switch,
	Text,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import "moment/locale/ru";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	FaDiscord,
	FaTelegramPlane,
	FaTiktok,
	FaTwitter,
	FaVk,
	FaYoutube,
} from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Link as RLink, useLocation, useNavigate } from "react-router-dom";
import {
	logout,
	refreshAccount,
	setSelectedAccount,
} from "../hooks/NewAuthManager";
import * as SettingsManager from "../hooks/SettingsManager";
import i18n from "../i18n";
import panorama from "../images/panorama.webp";
import plus_being from "../images/plus_being.png";
import plus_promo from "../images/plus_promo.png";
import steve from "../images/steve.png";
import { AppContext } from "../providers/AppContext";
import News from "../types/News";
import Settings from "../types/Settings";
import { isAdmin, isBanned, isPlus } from "../utils/userUtils";

function Play({ news, versionIndex }: { news: News[]; versionIndex: number }) {
	let ipcRenderer: any = null;
	try {
		ipcRenderer = window.require("electron").ipcRenderer;
	} catch (error) {
		console.error(error);
	}
	type versionType = "1.8" | "1.12";
	const versions: versionType[] = ["1.8", "1.12"];
	const [promo, setPromo] = useState<{
		image: string;
		redirect: string;
	} | null>(null);
	const location = useLocation();

	moment.locale(i18n.language === "ru" ? "ru" : "en");
	const context = useContext(AppContext);
	const getUser = () => {
		return context.props.accounts[context.props.selected_account || 0];
	};
	const { t } = useTranslation();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [status, setStatus] = useState<string>("");
	const [beta, setBeta] = useState<boolean>(
		SettingsManager.getSettings().branch === "experimental"
	);
	const [test, setTest] = useState<boolean>(
		SettingsManager.getSettings().branch === "test"
	);
	const [version, setVersion] = useState<"1.8" | "1.12">("1.8");
	const [updating, setUpdating] = useState<boolean>(false);
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const crashModal = useDisclosure();
	const patchingModal = useDisclosure();

	ipcRenderer?.on("app/crashReport", function (evt: any) {
		crashModal.onOpen();
	});

	ipcRenderer?.on("app/updating", function (evt: any) {
		setUpdating(true);
		patchingModal.onOpen();
	});

	ipcRenderer?.on(
		"launch/status",
		function (evt: any, message: { status: string }) {
			setStatus(message.status);
		}
	);

	ipcRenderer?.on(
		"settings/customJar",
		function (evt: any, message: { path: string }) {
			launch({
				memory: SettingsManager.getSettings().memory,
				branch: "custom",
				version: SettingsManager.getSettings().version,
				jarPath: message.path,
				minecraftPath: SettingsManager.getSettings().minecraftPath,
				width: SettingsManager.getSettings().width,
				height: SettingsManager.getSettings().height,
				discord: SettingsManager.getSettings().discord,
				afterLaunch: SettingsManager.getSettings().afterLaunch,
				preLoadCosmetics: SettingsManager.getSettings().preLoadCosmetics,
			});
		}
	);

	useEffect(() => {
		SettingsManager.setSettings({
			memory: SettingsManager.getSettings().memory,
			branch: SettingsManager.getSettings().branch,
			version: version,
			jarPath: SettingsManager.getSettings().jarPath,
			minecraftPath: SettingsManager.getSettings().minecraftPath,
			width: SettingsManager.getSettings().width,
			height: SettingsManager.getSettings().height,
			discord: SettingsManager.getSettings().discord,
			afterLaunch: SettingsManager.getSettings().afterLaunch,
			preLoadCosmetics: SettingsManager.getSettings().preLoadCosmetics,
		});
		if (
			(SettingsManager.getSettings().branch === "experimental" &&
				!isPlus(context)) ||
			(SettingsManager.getSettings().branch === "test" && !isAdmin(context))
		) {
			setBeta(false);
			setTest(false);
			SettingsManager.setSettings({
				memory: SettingsManager.getSettings().memory,
				branch: "stable",
				version: SettingsManager.getSettings().version,
				jarPath: SettingsManager.getSettings().jarPath,
				minecraftPath: SettingsManager.getSettings().minecraftPath,
				width: SettingsManager.getSettings().width,
				height: SettingsManager.getSettings().height,
				discord: SettingsManager.getSettings().discord,
				afterLaunch: SettingsManager.getSettings().afterLaunch,
				preLoadCosmetics: SettingsManager.getSettings().preLoadCosmetics,
			});
		}
		const getData = async () => {
			const { data: res } = await axios.get(
				"https://api.silentclient.net/assets/launcher/promo.json"
			);
			setPromo(res.promo);
		};

		getData();
	}, []);

	const navigate = useNavigate();

	const launch = async (settings?: Settings) => {
		if (isLoading) {
			return;
		}
		setUpdating(false);
		setIsLoading(true);
		try {
			setStatus("Refreshing authorization");

			const auth = await refreshAccount({
				access_token: getUser().accessToken,
				mc_access_token: getUser().mcAccessToken,
				mc_refresh_token: getUser().refresh_token,
			});

			if (auth?.raw && auth.user && context.setProps) {
				context.setProps({
					accounts: [
						...context.props.accounts.filter(u => u.id !== auth.user?.id),
						auth.user,
					],
					selected_account: context.props.accounts.filter(
						u => u.id !== auth.user?.id
					).length,
				});
				await setSelectedAccount(context.props.selected_account || 0);
			} else {
				logout(context);
				window.location.reload();
			}
			if (isBanned(context)) {
				toast({
					title: t("launch.errors.title"),
					description: t("launch.errors.banned"),
					status: "error",
					duration: 6000,
					isClosable: true,
					position: "bottom",
				});
				return;
			}

			try {
				setStatus("Connecting to servers");
				await axios.post("https://api.silentclient.net/stats/launch", null, {
					headers: {
						Authorization: `Bearer ${getUser()?.accessToken}`,
					},
				});
			} catch {}

			const launch = await ipcRenderer.invoke("app/launch", {
				account: auth?.user,
				settings: settings || SettingsManager.getSettings(),
				auth: auth?.user,
			});
			if (launch.error) {
				toast({
					title: t("launch.errors.title"),
					description: `${launch.error}`,
					status: "error",
					duration: 6000,
					isClosable: true,
					position: "bottom",
				});
			}
		} catch (error) {
			toast({
				title: t("launch.errors.title"),
				description: `${error}`,
				status: "error",
				duration: 6000,
				isClosable: true,
				position: "bottom",
			});
		} finally {
			setIsLoading(false);
		}
		setUpdating(false);
	};

	return location.pathname !== "/" ? null : (
		<Container maxW="full" minW="full">
			<Stack
				borderRadius={"lg"}
				padding={5}
				direction="row"
				justifyContent={"space-between"}
				bgImage={promo ? promo.image : panorama}
				bgRepeat="no-repeat"
				bgPosition={"center"}
				bgSize="cover"
			>
				<Box
					w="full"
					cursor={promo?.redirect ? "pointer" : "default"}
					onClick={() =>
						window.require("electron").shell.openExternal(promo?.redirect)
					}
				/>
				<Stack
					bgColor={"rgb(19, 19, 19)"}
					boxShadow="rgba(0, 0, 0, 0.1) 0px 15px 9px 0px"
					borderRadius={"lg"}
					padding={3}
					minW="300px"
					maxW="300px"
					direction={"column"}
					spacing={3}
				>
					<Center p={2}>
						<Heading size="md">{t("launch.header")}</Heading>
					</Center>
					{/* {versionIndex > 4 && (
						<Stack direction={"row"} w="full" justifyContent={"space-between"}>
							<Center h="full">
								<Text fontSize={"lg"} fontWeight={"bold"}>
									{t("launch.mcVersion")}:
								</Text>
							</Center>
							<Menu>
								<MenuButton
									as={Button}
									size="sm"
									minW={i18n.language === "ru" ? "146px" : "123.27px"}
									maxW={i18n.language === "ru" ? "146px" : "123.27px"}
									rightIcon={<ChevronDownIcon />}
									textAlign="left"
								>
									<Text maxW="90px" overflow={"hidden"} textOverflow="ellipsis">
										{version}
									</Text>
								</MenuButton>

								<MenuList bgColor="black">
									{versions.map(v => {
										if (version === v) {
											return null;
										}

										return (
											<MenuItem
												as={Button}
												borderRadius={0}
												justifyContent="start"
												bgColor="black"
												onClick={() => {
													setVersion(v);
													SettingsManager.setSettings({
														memory: SettingsManager.getSettings().memory,
														branch: SettingsManager.getSettings().branch,
														version: v,
														jarPath: SettingsManager.getSettings().jarPath,
														minecraftPath:
															SettingsManager.getSettings().minecraftPath,
														width: SettingsManager.getSettings().width,
														height: SettingsManager.getSettings().height,
														discord: SettingsManager.getSettings().discord,
														afterLaunch:
															SettingsManager.getSettings().afterLaunch,
														preLoadCosmetics:
															SettingsManager.getSettings().preLoadCosmetics,
													});
												}}
											>
												{v}
											</MenuItem>
										);
									})}
								</MenuList>
							</Menu>
						</Stack>
					)} */}
					<Stack spacing={5} direction={"row"} justifyContent="space-between">
						<Stack w="full" direction={"row"} justifyContent="space-between">
							<Center h="full">
								<Text color="#ffe600" fontSize={"lg"} fontWeight={"bold"}>
									{t("launch.beta")}:
								</Text>
							</Center>
							<Switch
								isChecked={beta}
								onChange={e => {
									if (!isPlus(context)) {
										onOpen();
										return;
									}

									setBeta(!beta);
									setTest(false);
									SettingsManager.setSettings({
										memory: SettingsManager.getSettings().memory,
										branch: !beta ? "experimental" : "stable",
										version: SettingsManager.getSettings().version,
										jarPath: SettingsManager.getSettings().jarPath,
										minecraftPath: SettingsManager.getSettings().minecraftPath,
										width: SettingsManager.getSettings().width,
										height: SettingsManager.getSettings().height,
										discord: SettingsManager.getSettings().discord,
										afterLaunch: SettingsManager.getSettings().afterLaunch,
										preLoadCosmetics:
											SettingsManager.getSettings().preLoadCosmetics,
									});
								}}
								colorScheme={"yellow"}
								size={"lg"}
								id="beta"
							/>
						</Stack>
						<RLink to={"/settings"}>
							<Stack
								w="full"
								direction={"row"}
								justifyContent="space-between"
								as={Link}
								_hover={{
									opacity: "0.8",
									textDecoration: "none",
								}}
							>
								<Center h="full">
									<Text fontSize={"lg"} fontWeight={"bold"}>
										{t("launch.settings")}:
									</Text>
								</Center>
								<IconButton
									aria-label="Settings"
									icon={<SettingsIcon color="white" h="28px" w="28px" />}
									variant="link"
								></IconButton>
							</Stack>
						</RLink>
					</Stack>
					{isAdmin(context) && (
						<Stack spacing={5} direction={"row"} justifyContent="space-between">
							<Stack w="full" direction={"row"} justifyContent="space-between">
								<Center h="full">
									<Text fontSize={"lg"} fontWeight={"bold"}>
										{t("launch.test")}:
									</Text>
								</Center>
								<Switch
									isChecked={test}
									onChange={e => {
										setBeta(false);
										setTest(!test);
										SettingsManager.setSettings({
											memory: SettingsManager.getSettings().memory,
											branch: !test ? "test" : "stable",
											version: SettingsManager.getSettings().version,
											jarPath: SettingsManager.getSettings().jarPath,
											minecraftPath:
												SettingsManager.getSettings().minecraftPath,
											width: SettingsManager.getSettings().width,
											height: SettingsManager.getSettings().height,
											discord: SettingsManager.getSettings().discord,
											afterLaunch: SettingsManager.getSettings().afterLaunch,
											preLoadCosmetics:
												SettingsManager.getSettings().preLoadCosmetics,
										});
									}}
									colorScheme={"green"}
									size={"lg"}
									id="test"
								/>
							</Stack>
							<Button
								minW={i18n.language === "ru" ? "146px" : "123.27px"}
								size="sm"
								onClick={() => ipcRenderer.send("app/getCustomJar")}
							>
								Custom Jar
							</Button>
						</Stack>
					)}
					<Stack direction={"row"} w="full" justifyContent={"space-between"}>
						<Center h="full">
							<Text fontSize={"lg"} fontWeight={"bold"}>
								{t("launch.account.title")}:
							</Text>
						</Center>
						<Menu>
							<MenuButton
								as={Button}
								size="sm"
								minW={i18n.language === "ru" ? "146px" : "123.27px"}
								maxW={i18n.language === "ru" ? "146px" : "123.27px"}
								leftIcon={
									<Image
										w="20px"
										h="20px"
										borderRadius={5}
										src={`https://mc-heads.net/avatar/${
											getUser()?.original_username
										}.png`}
										fallbackSrc={steve}
									/>
								}
								rightIcon={<ChevronDownIcon />}
							>
								<Text maxW="90px" overflow={"hidden"} textOverflow="ellipsis">
									{getUser()?.original_username}
								</Text>
							</MenuButton>

							<MenuList bgColor="black">
								<MenuGroup title="Current account">
									<MenuItem
										as={Button}
										borderRadius={0}
										justifyContent="start"
										bgColor="black"
										leftIcon={<EditIcon />}
										onClick={() => {
											window
												.require("electron")
												.shell.openExternal(
													"https://store.silentclient.net/edit_account"
												);
										}}
									>
										{t("launch.account.edit")}
									</MenuItem>
									<MenuItem
										as={Button}
										borderRadius={0}
										justifyContent="start"
										bgColor="black"
										leftIcon={<CloseIcon />}
										onClick={async () => {
											logout(context);
										}}
									>
										{t("launch.account.logout")}
									</MenuItem>
								</MenuGroup>
								<MenuGroup title="Other accounts">
									<MenuItem
										as={Button}
										borderRadius={0}
										justifyContent="start"
										bgColor="black"
										leftIcon={<AddIcon />}
										onClick={() => {
											navigate("/login");
										}}
									>
										Add account
									</MenuItem>
									{context.props.accounts.map(
										(user, key) =>
											user.id !== getUser().id && (
												<MenuItem
													as={Button}
													borderRadius={0}
													justifyContent="start"
													bgColor="black"
													leftIcon={
														<Image
															w="20px"
															h="20px"
															borderRadius={5}
															src={`https://mc-heads.net/avatar/${user.original_username}.png`}
															fallbackSrc={steve}
														/>
													}
													onClick={async () => {
														if (context.setProps) {
															context.setProps({
																...context.props,
																selected_account: key,
															});
															await setSelectedAccount(key);
														}
													}}
												>
													<Text
														maxW="150px"
														overflow={"hidden"}
														textOverflow="ellipsis"
													>
														{user.original_username}
													</Text>
												</MenuItem>
											)
									)}
								</MenuGroup>
							</MenuList>
						</Menu>
					</Stack>
					<Button
						fontWeight={"bold"}
						size={"lg"}
						fontSize="2xl"
						textTransform={"uppercase"}
						opacity={isLoading ? "0.7" : "1"}
						onClick={() => {
							if (!isLoading) {
								launch();
							} else if (updating) {
								patchingModal.onOpen();
							}
						}}
						leftIcon={isLoading ? <Spinner /> : undefined}
					>
						{isLoading
							? updating
								? t("launch.button.updating")
								: t("launch.button.loading")
							: t("launch.button.launch")}
					</Button>
				</Stack>
			</Stack>
			<Modal isOpen={patchingModal.isOpen} onClose={patchingModal.onClose}>
				<ModalOverlay />
				<ModalContent bgColor={"rgb(19, 19, 19)"}>
					<ModalHeader w="full" textAlign={"center"}>
						{t("launch.button.updating")}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Link
							onClick={() =>
								window
									.require("electron")
									.shell.openExternal("https://store.silentclient.net/premium")
							}
						>
							<Image
								src={!isPlus(context) ? plus_promo : plus_being}
								borderRadius={"lg"}
								w="400px"
								h="150px"
							></Image>
						</Link>
						<Progress
							mt={5}
							colorScheme={"whiteAlpha"}
							borderRadius={"lg"}
							isIndeterminate
						/>
						<Center>
							<Text mt={3}>{status}</Text>
						</Center>
					</ModalBody>
				</ModalContent>
			</Modal>
			<Modal isOpen={crashModal.isOpen} onClose={crashModal.onClose}>
				<ModalOverlay />
				<ModalContent bgColor={"rgb(19, 19, 19)"}>
					<ModalHeader w="full" textAlign={"center"}>
						{t("crash_modal.title")}
					</ModalHeader>
					<ModalBody>
						<Text textAlign={"center"} fontSize={"lg"}>
							{t("crash_modal.description")}
						</Text>
					</ModalBody>
					<ModalFooter>
						<Button w="full" onClick={crashModal.onClose}>
							{t("crash_modal.button")}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent bgColor={"rgb(19, 19, 19)"}>
					<ModalHeader w="full" textAlign={"center"}>
						{t("only_plus_modal.title")}
					</ModalHeader>
					<ModalBody>
						<Text textAlign={"center"} fontSize={"lg"}>
							{t("only_plus_modal.description")}
						</Text>
					</ModalBody>
					<ModalFooter>
						<Button
							w="full"
							onClick={() =>
								window
									.require("electron")
									.shell.openExternal("https://store.silentclient.net/premium")
							}
						>
							{t("only_plus_modal.buy")}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<Stack mt={5} direction={["column", "row"]} spacing={10}>
				<Box id="news" minW="65%">
					<Center>
						<Heading size={"lg"}>{t("news.title")}</Heading>
					</Center>
					<Stack mt={5} direction={"column"} spacing={5}>
						{news.map(item => (
							<Stack
								direction={"column"}
								spacing={3}
								w="full"
								borderRadius={"lg"}
								bgColor={"rgb(19, 19, 19)"}
								boxShadow="rgba(0, 0, 0, 0.1) 0px 15px 9px 0px"
								p={5}
							>
								<Stack direction={"column"} spacing={1}>
									<Heading size="lg">{item.title}</Heading>
									<Text>{moment(item.created_at).format("LL")}</Text>
								</Stack>
								<Box minH="427px">
									<LazyLoadImage
										src={`https://image.eitherdigital.ru/resize?image=https://api.silentclient.net${item.cover}&w=1920&h=1080`}
										effect="blur"
										width={"100%"}
										height={"auto"}
										style={{ borderRadius: "var(--silentclient-radii-lg)" }}
									/>
								</Box>
								<Button
									onClick={() =>
										window
											.require("electron")
											.shell.openExternal(
												"https://silentclient.net/news/" + item.id.toString()
											)
									}
									w="full"
								>
									{t("news.read")}
								</Button>
							</Stack>
						))}
					</Stack>
				</Box>
				<Stack direction={"column"} w="full" spacing={5}>
					<Box id="socials" w="full">
						<Center>
							<Heading size={"lg"}>{t("socials.title")}</Heading>
						</Center>
						<SimpleGrid
							mt={5}
							columns={3}
							spacing={2}
							borderRadius={"lg"}
							bgColor={"rgb(19, 19, 19)"}
							boxShadow="rgba(0, 0, 0, 0.1) 0px 15px 9px 0px"
							p={5}
						>
							<IconButton
								w="full"
								h="108px"
								aria-label="Discord"
								icon={<FaDiscord size={70} />}
								_hover={{
									bgColor: "#7289da",
								}}
								onClick={() =>
									window
										.require("electron")
										.shell.openExternal("https://dsc.gg/silentclient")
								}
							/>
							<IconButton
								w="full"
								h="108px"
								aria-label="Telegram"
								icon={<FaTelegramPlane size={70} />}
								_hover={{
									bgColor: "#2AABEE",
								}}
								onClick={() =>
									window
										.require("electron")
										.shell.openExternal("https://t.me/silent_client")
								}
							/>
							<IconButton
								w="full"
								h="108px"
								aria-label="Twitter"
								icon={<FaTwitter size={70} />}
								_hover={{
									bgColor: "#1DA1F2",
								}}
								onClick={() =>
									window
										.require("electron")
										.shell.openExternal("https://twitter.com/@SilentClientMC")
								}
							/>
							<IconButton
								w="full"
								h="108px"
								aria-label="YouTube"
								icon={<FaYoutube size={70} />}
								_hover={{
									bgColor: "#FF0000",
								}}
								onClick={() =>
									window
										.require("electron")
										.shell.openExternal(
											"https://www.youtube.com/@SilentClientMC"
										)
								}
							/>
							<IconButton
								w="full"
								h="108px"
								aria-label="TikTok"
								icon={<FaTiktok size={70} />}
								_hover={{
									bgColor: "#ff0050",
								}}
								onClick={() =>
									window
										.require("electron")
										.shell.openExternal(
											"https://www.tiktok.com/@SilentClientMC"
										)
								}
							/>
							<IconButton
								w="full"
								h="108px"
								aria-label="VK"
								icon={<FaVk size={70} />}
								_hover={{
									bgColor: "#0077FF",
								}}
								onClick={() =>
									window
										.require("electron")
										.shell.openExternal("https://vk.com/silentclient")
								}
							/>
						</SimpleGrid>
					</Box>
				</Stack>
			</Stack>
		</Container>
	);
}

export default Play;

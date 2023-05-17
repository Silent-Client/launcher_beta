import { Box, Center, Image, Stack } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { getAuth, getUser } from "./hooks/AuthManager";
import { getSettings, setSettings } from "./hooks/SettingsManager";
import full_logo from "./images/full_logo.svg";
import ChangeUsername from "./pages/ChangeUsername";
import Login from "./pages/Login";
import NeedElectron from "./pages/NeedElectron";
import Play from "./pages/Play";
import Settings from "./pages/Settings";
import Skins from "./pages/Skins";
import News from "./types/News";
import version, { getVersionIndex, isDebug } from "./utils/version";

function App() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [ram, setRam] = useState<number>(16000);
	const [versionIndex, setVersionIndex] = useState<number>(16);
	const [needElectron, setNeedElectron] = useState<boolean>(false);
	const [news, setNews] = useState<News[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		const getData = async () => {
			setIsLoading(true);
			try {
				document.title = `Silent Client ${version()}`;
				let ipcRenderer = null;
				try {
					ipcRenderer = window.require("electron").ipcRenderer;
				} catch (error) {
					console.error(error);
				}

				const versionIndex = await getVersionIndex();
				setVersionIndex(versionIndex);

				await getAuth(navigate);

				const { data: news } = await axios.get(
					"https://api.silentclient.net/_next/get_news"
				);
				if (news.news.length > 3) {
					news.news.length = 3;
				}
				setNews(news.news);
				if (getSettings().preLoadCosmetics === undefined) {
					setSettings({
						memory: getSettings().memory,
						branch: getSettings().branch,
						version: getSettings().version,
						jarPath: getSettings().jarPath,
						minecraftPath: getSettings().minecraftPath,
						width: getSettings().width,
						height: getSettings().height,
						discord: getSettings().discord,
						afterLaunch: getSettings().afterLaunch,
						preLoadCosmetics: true,
					});
				}
				if (versionIndex > 2 && getSettings().memory < 1000) {
					setSettings({
						memory: getSettings().memory * 1000,
						branch: getSettings().branch,
						version: getSettings().version,
						jarPath: getSettings().jarPath,
						minecraftPath: getSettings().minecraftPath,
						width: getSettings().width,
						height: getSettings().height,
						discord: getSettings().discord,
						afterLaunch: getSettings().afterLaunch,
						preLoadCosmetics: true,
					});
				}
				console.log(
					`Launcher Information:\n\nElectron: ${
						ipcRenderer === null ? "Not Found" : "Found"
					}\nVersion Index: ${versionIndex}\nDebug: ${isDebug()}`
				);

				if (isDebug()) {
					return;
				}

				if (ipcRenderer === null) {
					setNeedElectron(true);
				} else {
					const ram = await ipcRenderer?.invoke("app/ram");
					setRam(ram);
					if (!getSettings().minecraftPath && versionIndex > 1) {
						const path = await ipcRenderer?.invoke(
							"app/getDefaultMinecraftPath"
						);

						setSettings({
							memory: getSettings().memory,
							branch: getSettings().branch,
							version: getSettings().version,
							jarPath: getSettings().jarPath,
							minecraftPath: path,
							width: getSettings().width,
							height: getSettings().height,
							discord: getSettings().discord,
							afterLaunch: getSettings().afterLaunch,
							preLoadCosmetics: getSettings().preLoadCosmetics,
						});
					}
				}
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		getData();
	}, []);

	return (
		<>
			{(isLoading && (
				<Box h="100vh">
					<Center h="full">
						<Image src={full_logo} w="400px" />
					</Center>
				</Box>
			)) || (
				<Box id="launcher">
					{(needElectron && <NeedElectron />) || (
						<>
							<Stack
								direction={"column"}
								justifyContent="space-between"
								minH="100vh"
							>
								<Box>
									{getUser() && <Header />}

									<Box
										paddingInlineStart={5}
										paddingInlineEnd={5}
										paddingTop={5}
										mb={5}
									>
										{(getUser() && (
											<Routes>
												<Route
													path="/"
													element={
														<Play news={news} versionIndex={versionIndex} />
													}
												/>
												<Route
													path="/settings"
													element={
														<Settings ram={ram} versionIndex={versionIndex} />
													}
												/>
												<Route path="/skins" element={<Skins />} />
												<Route
													path="/change_username/:username"
													element={<ChangeUsername />}
												/>
											</Routes>
										)) || (
											<Routes>
												<Route path="*" element={<Login />} />
											</Routes>
										)}
									</Box>
								</Box>
								<Footer versionIndex={versionIndex} />
							</Stack>
						</>
					)}
				</Box>
			)}
		</>
	);
}

export default App;

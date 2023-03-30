import { Box, Center, Image } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import { getAuth, getUser } from "./hooks/AuthManager";
import { getSettings, setSettings } from "./hooks/SettingsManager";
import full_logo from "./images/full_logo.svg";
import Login from "./pages/Login";
import NeedElectron from "./pages/NeedElectron";
import Play from "./pages/Play";
import Settings from "./pages/Settings";
import Skins from "./pages/Skins";
import News from "./types/News";
import version, { getVersionIndex, isDebug } from "./utils/version";

function App() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [ram, setRam] = useState<number>(16);
	const [versionIndex, setVersionIndex] = useState<number>(16);
	const [needElectron, setNeedElectron] = useState<boolean>(false);
	const [news, setNews] = useState<News[]>([]);

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

				await getAuth();

				const { data: news } = await axios.get(
					"https://api.silentclient.net/_next/get_news"
				);
				if (news.news.length > 3) {
					news.news.length = 3;
				}
				setNews(news.news);

				if (isDebug()) {
					return;
				}

				if (ipcRenderer === null) {
					setNeedElectron(true);
				} else {
					const ram = await ipcRenderer?.invoke("app/ram");
					setRam(ram);
					if (!getSettings().minecraftPath && versionIndex > 1) {
						setSettings({
							memory: getSettings().memory,
							branch: getSettings().branch,
							jarPath: getSettings().jarPath,
							minecraftPath: await ipcRenderer?.invoke(
								"app/getDefaultMinecraftPath"
							),
							width: getSettings().width,
							height: getSettings().height,
							discord: getSettings().discord,
							afterLaunch: getSettings().afterLaunch,
						});
					}
				}
			} catch (error) {
			} finally {
				setIsLoading(false);
			}
		};

		getData();
	}, []);

	return (
		<HashRouter>
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
							{getUser() && <Header />}
							<Box
								paddingInlineStart={5}
								paddingInlineEnd={5}
								paddingTop={5}
								mb={5}
							>
								{(getUser() && (
									<Routes>
										<Route path="/" element={<Play news={news} />} />
										<Route
											path="/settings"
											element={
												<Settings ram={ram} versionIndex={versionIndex} />
											}
										/>
										<Route path="/skins" element={<Skins />} />
									</Routes>
								)) || (
									<Routes>
										<Route path="*" element={<Login />} />
									</Routes>
								)}
							</Box>
						</>
					)}
				</Box>
			)}
		</HashRouter>
	);
}

export default App;

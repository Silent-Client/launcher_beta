import { Button, Link, Stack, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function Footer({ versionIndex }: { versionIndex: number }) {
	const toast = useToast();
	let ipcRenderer: any = null;
	try {
		ipcRenderer = window.require("electron").ipcRenderer;
	} catch (error) {
		console.error(error);
	}
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { t } = useTranslation();

	return (
		<Stack
			direction={"row"}
			justifyContent={"space-between"}
			paddingInlineStart={10}
			paddingInlineEnd={10}
			pt={2}
			pb={2}
			w="full"
			bgColor={"rgb(19, 19, 19)"}
			boxShadow="rgba(0, 0, 0, 0.1) 0px 15px 9px 0px"
		>
			<Text fontWeight={"bold"} fontSize="sm">
				© {new Date().getFullYear()} Silent Client
			</Text>
			<Text>
				<Button
					fontWeight={"bold"}
					fontSize="sm"
					color="white"
					_hover={{
						color: "white",
						textDecoration: "none",
						opacity: isLoading || versionIndex < 4 ? "0.4" : "0.8",
					}}
					_active={{
						color: "white",
						opacity: isLoading || versionIndex < 4 ? "0.4" : "0.8",
					}}
					variant="link"
					isDisabled={isLoading || versionIndex < 4}
					onClick={async () => {
						if (versionIndex > 3) {
							setIsLoading(true);
							try {
								const data = await ipcRenderer.invoke("app/bugReport");

								if (data.error) {
									toast({
										title: t("footer.errors.title"),
										description: `${data.error}`,
										status: "error",
										duration: 6000,
										isClosable: true,
										position: "bottom",
									});
								}
							} catch (error) {
								toast({
									title: t("footer.errors.title"),
									description: `${error}`,
									status: "error",
									duration: 6000,
									isClosable: true,
									position: "bottom",
								});
							} finally {
								setIsLoading(false);
							}
						}
					}}
				>
					{t("footer.bug")}
				</Button>{" "}
				|{" "}
				<Link
					fontWeight={"bold"}
					fontSize="sm"
					_hover={{
						textDecoration: "none",
						opacity: "0.8",
					}}
					onClick={() =>
						window
							.require("electron")
							.shell.openExternal("https://status.silentclient.net")
					}
				>
					{t("footer.status")}
				</Link>{" "}
				|{" "}
				<Link
					fontWeight={"bold"}
					fontSize="sm"
					_hover={{
						textDecoration: "none",
						opacity: "0.8",
					}}
					onClick={() =>
						window
							.require("electron")
							.shell.openExternal("https://support.silentclient.net")
					}
				>
					{t("footer.support")}
				</Link>
			</Text>
		</Stack>
	);
}

export default Footer;

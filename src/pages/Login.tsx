import {
	Box,
	Button,
	Center,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Link,
	Stack,
	useToast,
} from "@chakra-ui/react";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { login, tryLogin } from "../hooks/AuthManager";

function Login() {
	const { t, i18n } = useTranslation();

	let ipcRenderer: any = null;
	try {
		ipcRenderer = window.require("electron").ipcRenderer;
	} catch (error) {
		console.error(error);
	}
	const toast = useToast();
	const [isLoading, setIsLoading] = React.useState(false);

	const [scEmail, setScEmail] = React.useState("");
	const [scPassword, setScPassword] = React.useState("");
	const [auth, setAuth] = React.useState(false);
	const [mcToken, setMcToken] = React.useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const onSubmit = handleSubmit(async data => {
		setIsLoading(true);
		try {
			const res = await tryLogin(data.email, data.password);

			if (res.errors) {
				for (const err of res.errors) {
					toast({
						title: t("login.errors.title"),
						description: t(`login.errors.${err.message}`),
						status: "error",
						duration: 3000,
						isClosable: true,
					});
				}
				return;
			}

			setScEmail(data.email);
			setScPassword(data.password);
			const language = i18n.language;
			ipcRenderer?.send("app/clearcookie");
			i18n.changeLanguage(language);
			setAuth(true);
		} catch (error: any) {
			toast({
				title: "Error!",
				description: error?.message || `${error}`,
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	});

	return (
		<Box id="login">
			<Center w="full" minH="90vh" h="full">
				{(!auth && (
					<form onSubmit={onSubmit}>
						<Stack direction="column" spacing="10px">
							<Center>
								<Heading>{t("login.silent.header")}</Heading>
							</Center>
							<FormControl isInvalid={errors.email ? true : false}>
								<FormLabel>{t("login.silent.email")}</FormLabel>
								<Input
									isDisabled={isLoading}
									type="email"
									{...register("email", { required: true })}
								/>
								{errors.email && (
									<FormErrorMessage>
										{t("login.errors.required")}
									</FormErrorMessage>
								)}
							</FormControl>
							<FormControl isInvalid={errors.password ? true : false}>
								<FormLabel>{t("login.silent.password")}</FormLabel>
								<Input
									isDisabled={isLoading}
									type="password"
									{...register("password", { required: true })}
								/>
								{errors.password && (
									<FormErrorMessage>
										{t("login.errors.required")}
									</FormErrorMessage>
								)}
							</FormControl>
							<Button w="full" type="submit" isDisabled={isLoading}>
								{t("login.silent.login")}
							</Button>

							<Link
								onClick={() =>
									window
										.require("electron")
										.shell.openExternal(
											"https://store.silentclient.net/register"
										)
								}
							>
								{t("login.silent.register")}
							</Link>
							<Link
								onClick={() =>
									window
										.require("electron")
										.shell.openExternal(
											"https://store.silentclient.net/reset_password"
										)
								}
							>
								{t("login.silent.reset")}
							</Link>
						</Stack>
					</form>
				)) || (
					<Stack direction="column" spacing="10px">
						<Center>
							<Heading>{t("login.minecraft.header")}</Heading>
						</Center>
						<FormControl>
							<FormLabel>{t("login.minecraft.token")}</FormLabel>
							<Input
								onChange={e => {
									setMcToken(e.currentTarget.value);
								}}
								isDisabled={isLoading}
							/>
						</FormControl>

						<Button
							onClick={async () => {
								setIsLoading(true);
								try {
									const res = await login(scEmail, scPassword, mcToken);

									if (res.errors) {
										for (const err of res.errors) {
											toast({
												title: t("login.errors.title"),
												description: t(`login.errors.${err.message}`),
												status: "error",
												duration: 3000,
												isClosable: true,
											});
										}
										setScEmail("");
										setScPassword("");
										setMcToken("");
										const language = i18n.language;
										ipcRenderer?.send("app/clearcookie");
										i18n.changeLanguage(language);
										setAuth(false);
										return;
									}

									window.location.reload();
								} catch (error: any) {
									toast({
										title: t("login.errors.title"),
										description: error?.message
											? t(`login.errors.${error.message}`)
											: `${error}`,
										status: "error",
										duration: 3000,
										isClosable: true,
									});
								} finally {
									setIsLoading(false);
								}
							}}
							w="full"
							type="submit"
							isDisabled={isLoading}
						>
							{t("login.minecraft.login")}
						</Button>

						<Link
							onClick={() => {
								window.open(
									"https://login.live.com/oauth20_authorize.srf?client_id=b134f19c-06ef-418c-b87d-a58073f65a64&response_type=code&redirect_uri=https://auth.silentclient.net/auth&scope=XboxLive.signin%20offline_access&state=NOT_NEEDED"
								);
							}}
						>
							{t("login.minecraft.get_token")}
						</Link>
						<Link
							onClick={async () => {
								setIsLoading(true);
								try {
									const res = await login(scEmail, scPassword, null);

									if (res.errors) {
										for (const err of res.errors) {
											toast({
												title: t("login.errors.title"),
												description: t(`login.errors.${err.message}`),
												status: "error",
												duration: 3000,
												isClosable: true,
											});
										}
										setScEmail("");
										setScPassword("");
										setMcToken("");
										const language = i18n.language;
										ipcRenderer?.send("app/clearcookie");
										i18n.changeLanguage(language);
										setAuth(false);
										return;
									}

									window.location.reload();
								} catch (error: any) {
									toast({
										title: "Error!",
										description: error?.message
											? t(`login.errors.${error.message}`)
											: `${error}`,
										status: "error",
										duration: 3000,
										isClosable: true,
									});
								} finally {
									setIsLoading(false);
								}
							}}
						>
							{t("login.minecraft.cracked")}
						</Link>
					</Stack>
				)}
			</Center>
			<Stack direction={"row"} justifyContent="space-between" w="full">
				<Box />
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
		</Box>
	);
}

export default Login;
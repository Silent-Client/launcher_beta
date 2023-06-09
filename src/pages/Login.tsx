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
import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { login, tryLogin } from "../hooks/NewAuthManager";
import { AppContext } from "../providers/AppContext";
import version from "../utils/version";

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
	const context = useContext(AppContext);

	ipcRenderer?.on(
		"auth/setToken",
		async function (evt: any, { token }: { token: string }) {
			if (scEmail.trim() === "" || scPassword.trim() === "" || isLoading) {
				return;
			}
			console.log(token);
			setIsLoading(true);
			try {
				const res = await login(scEmail, scPassword, token, context);

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

					ipcRenderer?.send("app/clearcookie");

					setAuth(false);
					return;
				}

				window.location.href = `/?v=${version()}`;
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
		}
	);

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

			ipcRenderer?.send("app/clearcookie");

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
						<Button
							onClick={async () => {
								ipcRenderer.send("app/getAuthToken");
							}}
							colorScheme={"whatsapp"}
							isDisabled={isLoading}
						>
							{t("login.minecraft.microsoft")}
						</Button>
						<Button
							isDisabled={isLoading}
							onClick={async () => {
								setIsLoading(true);
								try {
									const res = await login(scEmail, scPassword, null, context);

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

										setAuth(false);
										return;
									}

									window.location.href = `/?v=${version()}`;
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
						</Button>
					</Stack>
				)}
			</Center>
			<Stack direction={"row"} justifyContent="space-between" w="full">
				<Box />
				<Link
					onClick={() =>
						i18n.changeLanguage(i18n.language === "ru" ? "en-US" : "ru")
					}
				>
					{i18n.language === "ru" ? "Switch to English" : "Перейти на русский"}
				</Link>
			</Stack>
		</Box>
	);
}

export default Login;

import {
	Button,
	Container,
	Heading,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { getUser, logout, updateAuth } from "../hooks/AuthManager";

function ChangeUsername() {
	const { username } = useParams();
	const navigate = useNavigate();
	const toast = useToast();
	const { t } = useTranslation();
	return (
		<Container maxW={"container.md"} textAlign={"center"}>
			<Heading mb={2}>{t("change_username.title")}</Heading>
			<Text mb={5}>{t("change_username.description")}</Text>
			<Stack direction={"row"} spacing={5}>
				<Button
					w="full"
					onClick={async () => {
						try {
							await axios.post(
								"https://api.silentclient.net/account/edit_profile",
								{
									username: username,
								},
								{
									headers: {
										authorization: `Bearer ${getUser()?.accessToken}`,
									},
								}
							);

							await updateAuth();
							navigate("/");
						} catch (err: any) {
							if (
								err?.response &&
								err.response?.data &&
								err.response.data?.errors
							) {
								for (const error of err.response.data.errors) {
									if (error.message === "Username already taken") {
										toast({
											title: "Username already taken",
											status: "error",
											duration: 3000,
											isClosable: true,
										});
									} else {
										toast({
											title: "Error!",
											description: error.message,
											status: "error",
											duration: 3000,
											isClosable: true,
										});
									}
								}
							}
						}
					}}
				>
					{t("change_username.change")}
				</Button>
				<Button
					w="full"
					onClick={() => {
						navigate("/");
						logout();
					}}
				>
					{t("change_username.logout")}
				</Button>
			</Stack>
		</Container>
	);
}

export default ChangeUsername;

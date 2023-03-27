import { Box, Center, Container, Image, Link, Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Link as RLink, useLocation } from "react-router-dom";
import full_logo from "../images/full_logo.svg";

export const MenuItems = [
	{
		name: "header.play",
		to: "/",
	},
	{
		name: "header.skins",
		to: "/skins",
	},
	{
		name: "header.store",
		to: "https://store.silentclient.net",
		isExternal: true,
	},
];

function Header() {
	const location = useLocation();
	const { t } = useTranslation();

	return (
		<Box bgColor="black" position="relative" w="full" zIndex={2} as="header">
			<Container
				maxW={["full", "full", "full", "full", "full", "90%"]}
				paddingInlineStart={[
					"15px",
					"15px",
					"15px",
					"2rem",
					"2rem",
					"3rem",
					"4rem",
				]}
				paddingInlineEnd={[
					"15px",
					"15px",
					"15px",
					"2rem",
					"2rem",
					"3rem",
					"4rem",
				]}
				minW="full"
				ml="auto"
				mr="auto"
			>
				<Stack direction="row" h="77px" justifyContent="space-between">
					<Link
						display={["block", "block"]}
						w="auto"
						userSelect={"none"}
						as={RLink}
						to={"/"}
					>
						<Center h="full">
							<Image h="39px" w="auto" src={full_logo} />
						</Center>
					</Link>

					<Center w="auto" h="full">
						<Stack direction="row" spacing={5}>
							{MenuItems.map(link => (
								<>
									{(link.isExternal && (
										<Link
											color={
												location.pathname === link.to
													? "white"
													: "rgb(114, 114, 114)"
											}
											fontSize="18px"
											fontWeight={600}
											_hover={{
												color: "white",
												textDecoration: "none",
											}}
											onClick={() =>
												window.require("electron").shell.openExternal(link.to)
											}
										>
											{t(link.name)}
										</Link>
									)) || (
										<Link
											color={
												location.pathname === link.to
													? "white"
													: "rgb(114, 114, 114)"
											}
											fontSize="18px"
											fontWeight={600}
											_hover={{
												color: "white",
												textDecoration: "none",
											}}
											as={RLink}
											to={link.to}
										>
											{t(link.name)}
										</Link>
									)}
								</>
							))}
						</Stack>
					</Center>
				</Stack>
			</Container>
		</Box>
	);
}

export default Header;

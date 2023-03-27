import { Box, Center, Image, Stack, Text } from "@chakra-ui/react";
import full_logo from "../images/full_logo.svg";

function NeedElectron() {
	return (
		<Box h="100vh">
			<Center h="full">
				<Box>
					<Stack spacing={2}>
						<Center>
							<Image src={full_logo} w="400px" />
						</Center>
						<Center>
							<Text>Electron is not available</Text>
						</Center>
					</Stack>
				</Box>
			</Center>
		</Box>
	);
}

export default NeedElectron;

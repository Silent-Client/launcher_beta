import axios from "axios";
import User from "../types/User";

const Store = window.localStorage;

function setAuth(user: User) {
	Store.setItem(
		"auth-data",
		JSON.stringify({
			id: user.id,
			accessToken: user.accessToken,
			email: user.email,
			username: user.username,
			original_username: user.original_username,
			is_admin: user.is_admin,
			is_partner: user.is_partner,
			is_plus: user.is_plus,
			custom_skin: user.custom_skin,
			skin_type: user.skin_type,
			mcAccessToken: user.mcAccessToken,
			clientToken: user.clientToken,
			refresh_token: user.refresh_token,
			uuid: user.uuid,
		})
	);
}

function getUser() {
	const data = Store.getItem("auth-data");

	if (!data) {
		return null;
	} else {
		let userData: User = JSON.parse(data);
		return userData;
	}
}

async function logout() {
	Store.clear();
	window.location.reload();
}

async function getAuth() {
	const user = getUser();

	if (!user) {
		return false;
	}

	await updateAuth();

	try {
		const { data: res } = await axios.get(
			`https://api.silentclient.net/account`,
			{
				headers: {
					authorization: `Bearer ${user.accessToken}`,
				},
			}
		);

		if (res.errors) {
			logout();
			return false;
		}

		return true;
	} catch {
		logout();
		return false;
	}
}

async function tryLogin(username: string, password: string) {
	try {
		const { data: res } = await axios.post(
			"https://api.silentclient.net/auth/login",
			{
				email: username,
				password: password,
			}
		);

		if (!res.auth.token) return { errors: [{ message: "bad login or pass" }] };

		return { errors: null };
	} catch (e: any) {
		return { errors: e.response.data.errors };
	}
}

async function login(
	username: string,
	password: string,
	mcToken: string | null
) {
	try {
		const { data: res } = await axios.post(
			"https://api.silentclient.net/auth/login",
			{
				email: username,
				password: password,
			}
		);

		if (!res.auth.token) return { errors: [{ message: "bad login or pass" }] };

		const { data: user } = await axios.get(
			`https://api.silentclient.net/account`,
			{
				headers: {
					authorization: `Bearer ${res.auth.token}`,
				},
			}
		);

		if (user.errors) return { errors: user.errors };

		setAuth({
			id: user.account.id,
			accessToken: res.auth.token,
			username: user.account.username,
			email: user.account.email,
			original_username: user.account.original_username,
			is_admin: user.account.is_admin,
			is_partner: user.account.is_partner,
			is_banned: user.account.is_banned,
			is_plus: user.account.is_plus,
			custom_skin: user.account.custom_skin,
			skin_type: user.account.skin_type,
			mcAccessToken: null,
			clientToken: null,
			refresh_token: null,
			uuid: null,
		});

		try {
			if (mcToken !== null) {
				const { data: mc } = await axios.post(
					"https://auth.silentclient.net/auth",
					{
						code: mcToken,
					}
				);

				if (mc.error) {
					let error = "";
					switch (mc.error) {
						default:
							error = "Unknown error =(";
							break;
						case 1:
							error = "Invalid email or password";
							break;
						case 2:
							error = "Please, off 2FA for login";
							break;
					}

					return { errors: [{ message: error }] };
				}

				if (user.account.original_username !== mc.name) {
					return {
						errors: [{ message: "Username MC and SC account does not match." }],
					};
				}

				setAuth({
					id: user.account.id,
					accessToken: res.auth.token,
					username: user.account.username,
					email: user.account.email,
					original_username: user.account.original_username,
					is_admin: user.account.is_admin,
					is_partner: user.account.is_partner,
					is_banned: user.account.is_banned,
					is_plus: user.account.is_plus,
					custom_skin: user.account.custom_skin,
					skin_type: user.account.skin_type,
					mcAccessToken: mc.access_token,
					clientToken: mc.client_token,
					refresh_token: mc.refresh_token,
					uuid: mc.uuid,
				});
			}
		} catch (e) {
			console.log(e);
		}

		return { errors: null };
	} catch (e: any) {
		return { errors: e.response.data.errors };
	}
}

async function updateAuth() {
	const user = getUser();
	if (!user) {
		logout();
		return { error: "not auth" };
	}

	try {
		const { data: res } = await axios.get(
			`https://api.silentclient.net/account`,
			{
				headers: {
					authorization: `Bearer ${user.accessToken}`,
				},
			}
		);

		if (res.errors) {
			logout();
			return { errors: true };
		}
		let mc = null;
		if (user.refresh_token !== null) {
			mc = await axios.post("https://auth.silentclient.net/refresh", {
				code: user.refresh_token,
			});

			if (mc.data?.error) {
				logout();
				let error = "";
				switch (mc.data.error) {
					default:
						error = "Unknown error =(";
						break;
					case 1:
						error = "Invalid email or password";
						break;
					case 2:
						error = "Please, off 2FA for login";
						break;
				}

				return { errors: [{ message: error }] };
			}

			if (res.account.original_username !== mc.data.name) {
				logout();
				return {
					errors: [{ message: "Username MC and SC account does not match." }],
				};
			}
		}

		let userData = {
			id: res.account.id,
			accessToken: user.accessToken,
			username: res.account.username,
			email: res.account.email,
			original_username: res.account.original_username,
			is_admin: res.account.is_admin,
			is_partner: res.account.is_partner,
			is_banned: res.account.is_banned,
			is_plus: res.account.is_plus,
			custom_skin: res.account.custom_skin,
			skin_type: res.account.skin_type,
			mcAccessToken: mc?.data.access_token || null,
			clientToken: mc?.data.client_token || null,
			refresh_token: mc?.data.refresh_token || null,
			uuid: mc?.data.id || null,
		};

		setAuth(userData);

		return { error: false };
	} catch {
		logout();
		return { error: true };
	}
}

export { getAuth, getUser, setAuth, logout, login, updateAuth, tryLogin };

import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import User from "../types/User";

const Store = window.localStorage;

function setAuth(user: User, init?: boolean) {
	const newUsers = [];
	let index = 0;
	let userIndex = 0;

	for (const oldUser of getUsers()) {
		if (oldUser.id !== user.id) {
			newUsers.push(oldUser);
		} else {
			newUsers.push(user);
			userIndex = index;
		}
		index++;
	}

	if (!newUsers.find(u => u.id === user.id)) {
		newUsers.push(user);
		userIndex += 1;
	}

	Store.setItem("auth-data", JSON.stringify(newUsers));
	if (!init) {
		setSelectedUser(userIndex);
	}
}

async function removeUser(id: number) {
	const newUsers = [];

	for (const oldUser of getUsers()) {
		if (oldUser.id !== id) {
			newUsers.push(oldUser);
		}
	}

	await Store.setItem("auth-data", JSON.stringify(newUsers));

	if (getSelectedUser() > newUsers.length - 1) {
		await setSelectedUser(0);
	}
}

async function setSelectedUser(index: number) {
	await Store.setItem("selected-auth", index.toString());
}

function getSelectedUser() {
	const data = Store.getItem("selected-auth");

	return data ? Number(data) : 0;
}

function getUsers() {
	const data = Store.getItem("auth-data");

	if (!data) {
		return [];
	} else {
		let userData: User[] = JSON.parse(data);

		return Array.isArray(userData) ? userData : [];
	}
}

function getUser() {
	const data = getUsers();
	const selected = Store.getItem("selected-auth");

	if (data.length === 0) {
		return null;
	}

	return data[selected ? Number(selected) : 0];
}

async function logout() {
	Store.removeItem("auth-data");
	Store.removeItem("selected-auth");
	window.location.reload();
}

async function getAuth(navigate: NavigateFunction) {
	const user = getUser();

	if (!user) {
		return false;
	}

	const auth = await updateAuth();
	if (auth.error === 1) {
		navigate(`/change_username/${auth.username}`);
		return;
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
			is_staff: user.account.is_staff,
			is_tester: user.account.is_tester,
			is_plus: user.account.is_plus,
			is_retired: user.account.is_retired,
			is_dev: user.account.is_dev,
			custom_skin: user.account.custom_skin,
			skin_type: user.account.skin_type,
			is_manager: user.account.is_manager,
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
					is_staff: user.account.is_staff,
					is_tester: user.account.is_tester,
					is_retired: user.account.is_retired,
					is_dev: user.account.is_dev,
					custom_skin: user.account.custom_skin,
					skin_type: user.account.skin_type,
					is_manager: user.account.is_manager,
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
		if (e?.response?.data?.errors) {
			return { errors: e?.response?.data?.errors };
		}
		return {
			errors: [
				{
					message: e,
				},
			],
		};
	}
}

async function updateAuth() {
	const user = getUser();
	if (!user) {
		logout();
		return { error: 3 };
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
			return { error: 2 };
		}
		let newUsername = {
			enabled: false,
			username: null,
		};
		let mc = null;
		if (user.refresh_token !== null) {
			mc = await axios.post("https://auth.silentclient.net/refresh", {
				code: user.refresh_token,
			});

			if (mc.data?.error) {
				logout();
				return { error: 2 };
			}

			if (res.account.original_username !== mc.data.name) {
				newUsername = {
					enabled: true,
					username: mc.data.name,
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
			is_staff: res.account.is_staff,
			is_tester: res.account.is_tester,
			is_plus: res.account.is_plus,
			is_retired: res.account.is_retired,
			is_dev: res.account.is_dev,
			is_manager: res.account.is_manager,
			custom_skin: res.account.custom_skin,
			skin_type: res.account.skin_type,
			mcAccessToken: mc?.data.access_token || null,
			clientToken: mc?.data.client_token || null,
			refresh_token: mc?.data.refresh_token || null,
			uuid: mc?.data.id || null,
		};

		setAuth(userData, true);

		if (newUsername.enabled && newUsername.username) {
			return { error: 1, username: newUsername.username };
		}

		return { error: false };
	} catch {
		logout();
		return { error: true };
	}
}

export {
	getAuth,
	getUser,
	setAuth,
	logout,
	login,
	updateAuth,
	tryLogin,
	setSelectedUser,
	getUsers,
	removeUser,
	getSelectedUser,
};

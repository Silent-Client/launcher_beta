import axios from "axios";
import { AppContextType } from "../providers/AppContext";
import User from "../types/User";

export interface IRawAccount {
	access_token: string;
	mc_access_token: string | null;
	mc_refresh_token: string | null;
}

export async function getRawAccounts() {
	const data = window.localStorage.getItem("mc-accounts");

	return data ? (JSON.parse(data) as IRawAccount[]) : [];
}

export async function setRawAccounts(data: IRawAccount[]) {
	window.localStorage.setItem("mc-accounts", JSON.stringify(data));
}

export async function getSelectedAccount() {
	const data = window.localStorage.getItem("mc-account");

	return data ? Number(data) : 0;
}

export async function setSelectedAccount(data: number) {
	window.localStorage.setItem("mc-account", data.toString());
}

export async function refreshAccount(account: IRawAccount) {
	try {
		let data: {
			raw: IRawAccount;
			user: User | null;
		} = {
			raw: account,
			user: null,
		};

		const { data: silent } = await axios.get(
			"https://api.silentclient.net/account",
			{
				headers: {
					Authorization: `Bearer ${account.access_token}`,
				},
			}
		);

		data.user = silent.account;
		if (data.user) {
			data.user.accessToken = account.access_token;
		}
		if (account.mc_refresh_token) {
			const { data: minecraft } = await axios.post(
				"https://auth.silentclient.net/refresh",
				{
					code: account.mc_refresh_token,
				}
			);

			if (data.user?.original_username !== minecraft.name) {
				return null;
			}

			if (data.user) {
				data.user.mcAccessToken = minecraft.access_token;
				data.user.clientToken = minecraft.client_token;
				data.user.refresh_token = minecraft.refresh_token;
				data.user.uuid = minecraft.id;
			}
		}

		return data;
	} catch {
		return null;
	}
}

export async function tryLogin(username: string, password: string) {
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

export async function login(
	username: string,
	password: string,
	mcToken: string | null,
	context: AppContextType
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

		let account: IRawAccount = {
			access_token: res.auth.token,
			mc_access_token: null,
			mc_refresh_token: null,
		};

		if (
			context.props.accounts.find(
				u => u.original_username === user.account.original_username
			)
		) {
			return { errors: null };
		}

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

				account.mc_access_token = mc.access_token;
				account.mc_refresh_token = mc.refresh_token;
			}
		} catch (e) {
			console.log(e);
		}

		const accounts = [...(await getRawAccounts()), account];
		await setRawAccounts(accounts);

		await setSelectedAccount(accounts.length - 1);

		return { errors: null };
	} catch (e: any) {
		if (e?.response?.data?.errors) {
			return { errors: e.response.data.errors };
		} else {
			return {
				errors: [
					{
						message: `${e}`,
					},
				],
			};
		}
	}
}

export async function logout(context: AppContextType) {
	let newUsers = [];
	let index = 0;

	for (const user of await getRawAccounts()) {
		if (index !== context.props.selected_account) {
			newUsers.push(user);
		}

		index++;
	}
	await setRawAccounts(newUsers);
	await setSelectedAccount(0);
	window.location.reload();
}

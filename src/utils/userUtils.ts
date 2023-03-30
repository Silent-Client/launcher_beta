import { getUser } from "../hooks/AuthManager";

export function isPlus() {
	return (
		getUser()?.is_plus === 1 ||
		getUser()?.is_admin === 1 ||
		getUser()?.is_staff === 1 ||
		getUser()?.is_tester === 1 ||
		getUser()?.is_partner === 1
	);
}

export function isAdmin() {
	return (
		getUser()?.is_admin === 1 ||
		getUser()?.is_staff === 1 ||
		getUser()?.is_tester === 1
	);
}

export function isBanned() {
	return getUser()?.is_banned === 1;
}

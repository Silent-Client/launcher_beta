import { AppContextType } from "../providers/AppContext";

export function isPartner(context: AppContextType) {
	return (
		context.props.accounts[context.props.selected_account || 0]?.is_partner ===
		1
	);
}

export function isPlus(context: AppContextType) {
	return (
		context.props.accounts[context.props.selected_account || 0]?.is_plus ===
			1 ||
		context.props.accounts[context.props.selected_account || 0]?.is_admin ===
			1 ||
		context.props.accounts[context.props.selected_account || 0]?.is_staff ===
			1 ||
		context.props.accounts[context.props.selected_account || 0]?.is_tester ===
			1 ||
		context.props.accounts[context.props.selected_account || 0]?.is_partner ===
			1 ||
		context.props.accounts[context.props.selected_account || 0]?.is_retired ===
			1 ||
		context.props.accounts[context.props.selected_account || 0]?.is_dev === 1 ||
		context.props.accounts[context.props.selected_account || 0]?.is_manager ===
			1
	);
}

export function isAdmin(context: AppContextType) {
	return (
		context.props.accounts[context.props.selected_account || 0]?.is_admin ===
			1 ||
		context.props.accounts[context.props.selected_account || 0]?.is_staff ===
			1 ||
		context.props.accounts[context.props.selected_account || 0]?.is_tester ===
			1 ||
		context.props.accounts[context.props.selected_account || 0]?.is_dev === 1 ||
		context.props.accounts[context.props.selected_account || 0]?.is_manager ===
			1
	);
}

export function isBanned(context: AppContextType) {
	return (
		context.props.accounts[context.props.selected_account || 0]?.is_banned === 1
	);
}

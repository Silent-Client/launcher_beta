export default interface User {
	id: number;
	accessToken: string;
	email: string;
	username: string;
	original_username: string;
	is_admin: number;
	is_partner: number;
	is_plus: number;
	is_banned: number;
	custom_skin: number;
	skin_type: "default" | "slim";
	mcAccessToken: string | null;
	clientToken: string | null;
	refresh_token: string | null;
	uuid: string | null;
}

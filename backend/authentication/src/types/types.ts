export interface AuthResultObj {
	success: boolean;
	userId?: number;
	error?: string;
	twoFA?: boolean;
}
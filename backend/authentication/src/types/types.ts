export interface AuthResultObj {
	success: boolean;
	userId?: number;
	error?: string;
	twoFA?: boolean;
}

export interface Enable2FAResultObj {
	success: boolean;
	twoFASecret?: string;
	qrCode?: string;
	error?: string;
}

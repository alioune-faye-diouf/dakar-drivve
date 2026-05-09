import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
    }>;
    setup(body: {
        email: string;
        password: string;
    }): Promise<import("./admin.entity").Admin>;
}

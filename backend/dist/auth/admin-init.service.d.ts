import { OnModuleInit } from '@nestjs/common';
import { AuthService } from './auth.service';
export declare class AdminInitService implements OnModuleInit {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    onModuleInit(): Promise<void>;
}

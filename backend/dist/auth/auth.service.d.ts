import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
export declare class AuthService {
    private adminRepository;
    private jwtService;
    constructor(adminRepository: Repository<Admin>, jwtService: JwtService);
    validateAdmin(email: string, pass: string): Promise<any>;
    login(admin: any): Promise<{
        access_token: string;
    }>;
    createAdmin(email: string, password: string): Promise<Admin>;
}

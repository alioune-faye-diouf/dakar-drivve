import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private configService;
    private genAI;
    private model;
    constructor(configService: ConfigService);
    chat(message: string): Promise<string>;
}

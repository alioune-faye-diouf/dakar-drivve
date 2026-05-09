import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body('message') message: string): Promise<{ reply: string }> {
    const reply = await this.aiService.chat(message);
    return { reply };
  }
}
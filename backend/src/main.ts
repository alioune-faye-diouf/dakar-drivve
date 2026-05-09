import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration CORS flexible pour le déploiement
  app.enableCors({
    origin: true, // Autorise toutes les origines (utile pour le test/vente)
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // Écouter sur toutes les interfaces (0.0.0.0) pour éviter les problèmes IPv6
  await app.listen(3000, '0.0.0.0');
  console.log(`🚀 Dakar Drive backend is running on: http://localhost:3000`);
}
bootstrap();
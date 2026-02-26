import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Vulpi API')
    .setDescription('Fakturační systém Vulpi - Public API')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'x-api-key')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

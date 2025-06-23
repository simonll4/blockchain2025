import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Middleware de morgan para logs de HTTP (formato 'dev')
  app.use(morgan('dev'));

  // Configuración de CORS (permite todas las solicitudes)
  app.enableCors({
    origin: true, // Permite cualquier origen (o usa '*' para todos)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Si necesitas cookies/tokens de autenticación
  });

  await app.listen(process.env.PORT ?? 5000);
}

bootstrap();

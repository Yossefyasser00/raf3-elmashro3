import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import express, { Express } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

const server: Express = express();
let isReady = false;

async function bootstrap() {
  if (!isReady) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { logger: ['error', 'warn', 'log'] }
    );

    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true, limit: '10mb' }));

    app.enableCors({
      origin: (origin, callback) => {
        callback(null, true);
      },
      credentials: true,
    });

    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    isReady = true;
  }
}

export default async function handler(req: any, res: any) {
  try {
    await bootstrap();
    return server(req, res);
  } catch (err: any) {
    console.error('Serverless Handler Error:', err);
    return res.status(500).json({
      statusCode: 500,
      message: 'Serverless initialization error',
      error: err?.message || String(err),
      stack: process.env.NODE_ENV === 'production' ? undefined : err?.stack,
    });
  }
}

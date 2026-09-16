import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded, Express } from 'express';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

const server: Express = express();
let isReady = false;

async function createNestServer(expressInstance: Express) {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
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
}

export default async function handler(req: any, res: any) {
  try {
    if (!isReady) {
      await createNestServer(server);
      isReady = true;
    }
    server(req, res);
  } catch (err: any) {
    console.error('Serverless Handler Error:', err);
    res.status(500).json({
      statusCode: 500,
      message: 'Serverless initialization error',
      error: err?.message || String(err),
    });
  }
}

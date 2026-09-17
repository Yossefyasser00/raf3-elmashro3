import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import express, { Express } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

let serverInstance: Express | null = null;
let initError: any = null;

async function bootstrap(): Promise<Express> {
  const server = express();

  // Try dist first, fallback to src
  let AppModule: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../dist/src/app.module');
    AppModule = mod.AppModule;
  } catch (e1) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('../src/app.module');
      AppModule = mod.AppModule;
    } catch (e2) {
      throw new Error(`Failed to load AppModule: dist error: ${e1}, src error: ${e2}`);
    }
  }

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
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

  app.useGlobalFilters({
    catch(exception: any, host: any) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status = exception?.getStatus ? exception.getStatus() : 500;
      console.error('APP_EXCEPTION:', exception);
      response.status(status).json({
        statusCode: status,
        message: exception?.message || 'Internal Error',
        details: exception?.response || String(exception),
      });
    },
  });

  await app.init();
  return server;
}

export default async function handler(req: any, res: any) {
  try {
    if (!serverInstance) {
      serverInstance = await bootstrap();
    }
    if (req.url) {
      // Fix duplicate /api/v1 prefixes if frontend passed baseUrl with /api/v1
      req.url = req.url.replace(/^\/api\/v1\/api\/v1/, '/api/v1');
      if (!req.url.startsWith('/api/v1')) {
        req.url = '/api/v1' + (req.url.startsWith('/') ? req.url : '/' + req.url);
      }
    }
    return serverInstance(req, res);
  } catch (err: any) {
    console.error('SERVERLESS_BOOTSTRAP_ERROR:', err);
    return res.status(500).json({
      statusCode: 500,
      error: 'Backend Initialization Error',
      message: err?.message || String(err),
      stack: err?.stack,
    });
  }
}

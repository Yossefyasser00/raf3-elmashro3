import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);

  private getOAuth2Client() {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new InternalServerErrorException(
        'YouTube API credentials are not configured. Please set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, and YOUTUBE_REFRESH_TOKEN in .env',
      );
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return oauth2Client;
  }

  /**
   * Upload a video to YouTube as a private video.
   * Returns the YouTube videoId.
   */
  async uploadVideo(
    videoBuffer: Buffer,
    title: string,
    description: string,
    mimeType = 'video/mp4',
  ): Promise<string> {
    const auth = this.getOAuth2Client();
    const youtube = google.youtube({ version: 'v3', auth });

    this.logger.log(`Uploading video to YouTube: "${title}"`);

    try {
      const videoStream = Readable.from(videoBuffer);

      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
            categoryId: '27', // Education
          },
          status: {
            privacyStatus: 'private',
          },
        },
        media: {
          mimeType,
          body: videoStream,
        },
      });

      const videoId = response.data.id;
      if (!videoId) throw new Error('YouTube did not return a videoId');

      this.logger.log(`Video uploaded successfully. YouTube videoId: ${videoId}`);
      return videoId;
    } catch (error: any) {
      this.logger.error('Failed to upload video to YouTube', error?.message);
      throw new InternalServerErrorException(
        `YouTube upload failed: ${error?.message ?? 'Unknown error'}`,
      );
    }
  }

  /**
   * Set a custom thumbnail for a YouTube video.
   */
  async setThumbnail(videoId: string, thumbnailBuffer: Buffer, mimeType = 'image/jpeg'): Promise<string> {
    const auth = this.getOAuth2Client();
    const youtube = google.youtube({ version: 'v3', auth });

    this.logger.log(`Setting thumbnail for videoId: ${videoId}`);

    try {
      const thumbStream = Readable.from(thumbnailBuffer);

      await youtube.thumbnails.set({
        videoId,
        media: {
          mimeType,
          body: thumbStream,
        },
      });

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      this.logger.log(`Thumbnail set successfully for videoId: ${videoId}`);
      return thumbnailUrl;
    } catch (error: any) {
      this.logger.warn(`Could not set thumbnail: ${error?.message}`);
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }
}

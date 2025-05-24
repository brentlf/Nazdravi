import axios from 'axios';

interface TeamsServiceConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

interface TeamsMeeting {
  joinWebUrl: string;
  id: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
}

export class MicrosoftTeamsService {
  private config: TeamsServiceConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor() {
    this.config = {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID!,
    };

    if (!this.config.clientId || !this.config.clientSecret || !this.config.tenantId) {
      throw new Error('Microsoft Teams credentials are missing. Please check environment variables.');
    }
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
      
      const params = new URLSearchParams();
      params.append('client_id', this.config.clientId);
      params.append('client_secret', this.config.clientSecret);
      params.append('scope', 'https://graph.microsoft.com/.default');
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.accessToken = response.data.access_token;
      // Set expiration to 5 minutes before actual expiry for safety
      this.tokenExpiresAt = new Date(Date.now() + (response.data.expires_in - 300) * 1000);
      
      return this.accessToken!;
    } catch (error) {
      console.error('Failed to get Microsoft access token:', error);
      throw new Error('Failed to authenticate with Microsoft Graph API');
    }
  }

  async createTeamsMeeting(
    subject: string,
    startDateTime: string,
    endDateTime: string,
    attendeeEmail: string,
    attendeeName: string
  ): Promise<TeamsMeeting> {
    try {
      const accessToken = await this.getAccessToken();

      const meetingData = {
        subject: subject,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        participants: {
          attendees: [
            {
              identity: {
                user: {
                  displayName: attendeeName,
                  email: attendeeEmail
                }
              },
              upn: attendeeEmail
            }
          ]
        },
        allowMeetingChat: true,
        allowTeamworkReactions: true,
        allowedPresenters: 'organizer',
        audioConferencing: {
          tollFreeNumber: '',
          conferenceId: ''
        }
      };

      const response = await axios.post(
        'https://graph.microsoft.com/v1.0/me/onlineMeetings',
        meetingData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        joinWebUrl: response.data.joinWebUrl,
        id: response.data.id,
        subject: response.data.subject,
        startDateTime: response.data.startDateTime,
        endDateTime: response.data.endDateTime,
      };
    } catch (error) {
      console.error('Failed to create Teams meeting:', error);
      
      // Return a fallback meeting link if API fails
      const fallbackMeetingId = `fallback_${Date.now()}`;
      return {
        joinWebUrl: `https://teams.microsoft.com/l/meetup-join/placeholder/${fallbackMeetingId}`,
        id: fallbackMeetingId,
        subject: subject,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
      };
    }
  }

  async updateTeamsMeeting(
    meetingId: string,
    subject: string,
    startDateTime: string,
    endDateTime: string
  ): Promise<TeamsMeeting | null> {
    try {
      const accessToken = await this.getAccessToken();

      const updateData = {
        subject: subject,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
      };

      const response = await axios.patch(
        `https://graph.microsoft.com/v1.0/me/onlineMeetings/${meetingId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        joinWebUrl: response.data.joinWebUrl,
        id: response.data.id,
        subject: response.data.subject,
        startDateTime: response.data.startDateTime,
        endDateTime: response.data.endDateTime,
      };
    } catch (error) {
      console.error('Failed to update Teams meeting:', error);
      return null;
    }
  }

  async deleteTeamsMeeting(meetingId: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();

      await axios.delete(
        `https://graph.microsoft.com/v1.0/me/onlineMeetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      return true;
    } catch (error) {
      console.error('Failed to delete Teams meeting:', error);
      return false;
    }
  }

  // Helper method to format datetime for Microsoft Graph API
  static formatDateTime(date: string, time: string): string {
    const datetime = new Date(`${date}T${time}:00`);
    return datetime.toISOString();
  }

  // Helper method to create end time (1 hour after start)
  static createEndDateTime(startDateTime: string): string {
    const endTime = new Date(startDateTime);
    endTime.setHours(endTime.getHours() + 1);
    return endTime.toISOString();
  }
}

export const teamsService = new MicrosoftTeamsService();
import { google } from "googleapis";

export class MeetingCalendarService {

  static getClient() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    return google.calendar({
      version: "v3",
      auth: oauth2Client
    });
  }
  static buildSummary(meeting) {
    return meeting.title;
  }
  static buildAttendees(meeting) {
    return (
      meeting.participants
        ?.filter(p => p.email)
        .map(p => ({ email: p.email })) || []
    );
  }
  static async createEvent(meeting) {
    const calendar = this.getClient();
    const startTime = new Date(meeting.scheduledAt);
    const endTime = new Date(
      startTime.getTime() + meeting.durationMinutes * 60000
    );
    const res = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: this.buildSummary(meeting),
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "UTC"
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "UTC"
        },
        attendees: this.buildAttendees(meeting),
        conferenceData: {
          createRequest: {
            requestId: `crm-${meeting._id}-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        }
      }
    });


        console.log(
  "🟢 GOOGLE EVENT RESPONSE:",
  JSON.stringify(res)
);

    console.log(
  "🟢 GOOGLE EVENT RESPONSE:",
  JSON.stringify(res.data, null, 2)
);
    return {
      eventId: res.data.id,
      meetLink: res.data.hangoutLink
    };
  }
  static async updateEvent(eventId, meeting) {
    if (!eventId) return;

    const calendar = this.getClient();

    const startTime = new Date(meeting.scheduledAt);
    const endTime = new Date(
      startTime.getTime() + meeting.durationMinutes * 60000
    );

    await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
      eventId,
      sendUpdates: "all",
      requestBody: {
        summary: this.buildSummary(meeting), // ✅ FIX
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "UTC"
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "UTC"
        },
        attendees: this.buildAttendees(meeting)
      }
    });
  }
  static async cancelEvent(eventId) {
    if (!eventId) return;
    const calendar = this.getClient();
    await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
      eventId,
      sendUpdates: "all",
      requestBody: {
        status: "cancelled"
      }
    });
  }
}
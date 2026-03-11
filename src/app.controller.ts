import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  docs() {
    return {
      name: 'well-vantage-tak API',
      version: '1.0.0',
      description: 'Workout plan manager with Google OAuth2 + JWT auth',
      base_url: 'http://localhost:3000',
      authentication: {
        type: 'Bearer JWT',
        note: 'Log in via GET /auth/google in a browser. Use the returned access_token in the Authorization header for all /workouts requests.',
      },
      endpoints: {
        root: {
          'GET /': {
            auth: false,
            description: 'Returns this API reference',
          },
        },
        auth: {
          'GET /auth/google': {
            auth: false,
            description: 'Redirects to Google login. Open in a browser.',
            response: '302 redirect → Google consent screen',
          },
          'GET /auth/google/callback': {
            auth: false,
            description:
              'Google redirects here after login. Returns a JWT token.',
            response: { access_token: '<jwt>' },
          },
        },
        workouts: {
          'POST /workouts': {
            auth: 'Bearer <access_token>',
            description: 'Create a workout plan for the logged-in user',
            request_body: {
              title: 'string',
              description: 'string',
              scheduledAt: 'ISO 8601 date string — e.g. 2026-03-15T07:00:00.000Z',
            },
            response_status: 201,
            response_body: {
              id: 'string (cuid)',
              title: 'string',
              description: 'string',
              scheduledAt: 'ISO 8601 date string',
              createdAt: 'ISO 8601 date string',
              userId: 'string',
            },
          },
          'GET /workouts': {
            auth: 'Bearer <access_token>',
            description:
              "Fetch all workout plans for the logged-in user, ordered by scheduledAt ascending",
            response_status: 200,
            response_body: 'Array of workout plan objects',
          },
        },
      },
      example_usage: {
        step_1: 'Open http://localhost:3000/auth/google in a browser and log in with Google',
        step_2: 'Copy the access_token from the response',
        step_3: {
          description: 'Create a workout plan',
          method: 'POST',
          url: 'http://localhost:3000/workouts',
          headers: { Authorization: 'Bearer <access_token>', 'Content-Type': 'application/json' },
          body: {
            title: 'Morning Run',
            description: '5km easy jog',
            scheduledAt: '2026-03-15T07:00:00.000Z',
          },
        },
        step_4: {
          description: 'Fetch your workout plans',
          method: 'GET',
          url: 'http://localhost:3000/workouts',
          headers: { Authorization: 'Bearer <access_token>' },
        },
      },
    };
  }
}

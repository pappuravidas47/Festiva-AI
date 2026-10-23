import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { getQuestionsForVendor } from '../src/services/ai/geminiService.js';
import { buildDemoPlan } from '../src/services/ai/demoPlanTemplates.js';

describe('Festiva AI Backend API Tests', () => {
  it('GET /api/health should report server status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBeOneOf([200, 503]);
    expect(res.body).toHaveProperty('service', 'Festiva AI API');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('ai');
  });

  it('POST /api/auth/register should reject invalid emails', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'invalid-email-format',
      password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors[0].field).toBe('email');
  });

  it('POST /api/auth/register should reject short passwords', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login should reject empty credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: '',
      password: '',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/events should return 401 when no token is supplied', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/ai/status should return engine readiness', async () => {
    const res = await request(app).get('/api/ai/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('geminiConfigured');
    expect(res.body).toHaveProperty('model');
  });

  it('getQuestionsForVendor should return targeted questions for Venue and Caterer', () => {
    const venueQuestions = getQuestionsForVendor('Venue', 'Wedding');
    expect(venueQuestions.length).toBeGreaterThanOrEqual(4);
    expect(venueQuestions.some((q) => q.toLowerCase().includes('curfew') || q.toLowerCase().includes('capacity'))).toBe(true);

    const catererQuestions = getQuestionsForVendor('Caterer', 'Birthday');
    expect(catererQuestions.some((q) => q.toLowerCase().includes('tasting'))).toBe(true);
  });

  it('buildDemoPlan should calculate budget allocations correctly', () => {
    const mockEvent: any = {
      name: 'Priya & Rahul Wedding',
      eventType: 'Wedding',
      eventDate: new Date('2026-12-25'),
      city: 'Jaipur',
      budget: 1000000,
      currency: '₹',
      guestCount: 250,
      indoorOutdoor: 'Outdoor',
      preferredColors: ['#B91C1C', '#D97706'],
    };

    const plan = buildDemoPlan(mockEvent);
    expect(plan.overview).toContain('Priya & Rahul Wedding');
    expect(plan.budgetBreakdown.totalEstimatedCost).toBe(1000000);
    expect(plan.budgetBreakdown.items.length).toBeGreaterThan(3);

    // Sum of items should match total
    const sum = plan.budgetBreakdown.items.reduce((acc, curr) => acc + curr.estimatedCost, 0);
    expect(sum).toBe(1000000);
  });
});

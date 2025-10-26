#!/usr/bin/env node

/**
 * Free Tier API Endpoint Test Script
 *
 * Tests all new Free Tier endpoints:
 * - Profile (GET, POST, PUT)
 * - Symptoms (POST, GET, DELETE, stats)
 * - Journal (POST, GET, PUT, DELETE, search, stats)
 *
 * Usage:
 *   node test-free-tier-api.js <user_id>
 *
 * Example:
 *   node test-free-tier-api.js 12345678-1234-1234-1234-123456789abc
 */

const API_URL = process.env.API_URL || 'http://localhost:4000';
const USER_ID = process.argv[2];

if (!USER_ID) {
  console.error('❌ Error: USER_ID is required');
  console.error('');
  console.error('Usage: node test-free-tier-api.js <user_id>');
  console.error('');
  console.error('To get your user ID, run this in Supabase SQL Editor:');
  console.error('  SELECT id, email FROM auth.users LIMIT 5;');
  console.error('');
  process.exit(1);
}

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

function success(msg) {
  log(colors.green, '✅', msg);
}

function error(msg) {
  log(colors.red, '❌', msg);
}

function info(msg) {
  log(colors.blue, 'ℹ️ ', msg);
}

function section(msg) {
  console.log('');
  log(colors.yellow, '='.repeat(60));
  log(colors.yellow, msg);
  log(colors.yellow, '='.repeat(60));
}

// HTTP request helper
async function request(method, path, body = null) {
  const url = `${API_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  log(colors.gray, `${method} ${url}`);
  if (body) {
    log(colors.gray, 'Body:', JSON.stringify(body, null, 2));
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      log(colors.gray, 'Response:', JSON.stringify(data, null, 2));
      return { success: true, data, status: response.status };
    } else {
      log(colors.gray, 'Error Response:', JSON.stringify(data, null, 2));
      return { success: false, data, status: response.status };
    }
  } catch (err) {
    error(`Request failed: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// Test data
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

let symptomLogId = null;
let journalEntryId = null;

// =====================================================
// PROFILE TESTS
// =====================================================

async function testProfileEndpoints() {
  section('Testing Profile Endpoints');

  // Test 1: GET profile
  info('Test 1: GET /api/profile/:userId');
  const getResult = await request('GET', `/api/profile/${USER_ID}`);
  if (getResult.success) {
    success('GET profile successful');
  } else {
    error('GET profile failed');
  }

  // Test 2: POST/Create profile with onboarding data
  info('Test 2: POST /api/profile/:userId (create/update with onboarding data)');
  const createResult = await request('POST', `/api/profile/${USER_ID}`, {
    display_name: 'Test User',
    menopause_stage: 'perimenopause',
    primary_concerns: ['hot_flashes', 'sleep_issues'],
    onboarding_completed: true,
  });
  if (createResult.success) {
    success('POST profile successful - onboarding data saved');
  } else {
    error('POST profile failed');
  }

  // Test 3: PUT/Update profile
  info('Test 3: PUT /api/profile/:userId (update)');
  const updateResult = await request('PUT', `/api/profile/${USER_ID}`, {
    bio: 'Updated bio for testing',
    menopause_stage: 'menopause',
  });
  if (updateResult.success) {
    success('PUT profile successful');
  } else {
    error('PUT profile failed');
  }

  // Test 4: Verify updates
  info('Test 4: GET /api/profile/:userId (verify updates)');
  const verifyResult = await request('GET', `/api/profile/${USER_ID}`);
  if (verifyResult.success && verifyResult.data.profile?.menopause_stage === 'menopause') {
    success('Profile updates verified');
  } else {
    error('Profile verification failed');
  }
}

// =====================================================
// SYMPTOM TRACKING TESTS
// =====================================================

async function testSymptomEndpoints() {
  section('Testing Symptom Tracking Endpoints');

  // Test 1: POST symptom log
  info('Test 1: POST /api/symptoms/log');
  const createResult = await request('POST', '/api/symptoms/log', {
    user_id: USER_ID,
    log_date: today,
    symptoms: {
      hot_flashes: 4,
      anxiety: 3,
      sleep_issues: 5,
    },
    energy_level: 3,
    notes: 'Test symptom log - having a rough day',
  });
  if (createResult.success) {
    symptomLogId = createResult.data.symptomLog?.id;
    success(`POST symptom log successful (ID: ${symptomLogId})`);
  } else {
    error('POST symptom log failed');
  }

  // Test 2: POST another symptom log (yesterday)
  info('Test 2: POST /api/symptoms/log (yesterday)');
  const yesterdayResult = await request('POST', '/api/symptoms/log', {
    user_id: USER_ID,
    log_date: yesterday,
    symptoms: {
      hot_flashes: 2,
      mood_swings: 3,
    },
    energy_level: 4,
    notes: 'Feeling better today',
  });
  if (yesterdayResult.success) {
    success('POST symptom log (yesterday) successful');
  } else {
    error('POST symptom log (yesterday) failed');
  }

  // Test 3: GET symptom history
  info('Test 3: GET /api/symptoms/history/:userId?days=7');
  const historyResult = await request('GET', `/api/symptoms/history/${USER_ID}?days=7`);
  if (historyResult.success && historyResult.data.logs?.length >= 1) {
    success(`GET symptom history successful (${historyResult.data.logs.length} logs found)`);
  } else {
    error('GET symptom history failed');
  }

  // Test 4: GET symptom log for specific date
  info(`Test 4: GET /api/symptoms/date/:userId/${today}`);
  const dateResult = await request('GET', `/api/symptoms/date/${USER_ID}/${today}`);
  if (dateResult.success && dateResult.data.log) {
    success('GET symptom log by date successful');
  } else {
    error('GET symptom log by date failed');
  }

  // Test 5: GET symptom stats
  info('Test 5: GET /api/symptoms/stats/:userId?period=week');
  const statsResult = await request('GET', `/api/symptoms/stats/${USER_ID}?period=week`);
  if (statsResult.success && statsResult.data.stats) {
    success('GET symptom stats successful');
    info(`  Total days logged: ${statsResult.data.stats.total_days_logged}`);
    info(`  Avg energy level: ${statsResult.data.stats.avg_energy_level}`);
    if (statsResult.data.stats.most_frequent_symptoms?.length > 0) {
      info(`  Most frequent: ${statsResult.data.stats.most_frequent_symptoms[0].symptom}`);
    }
  } else {
    error('GET symptom stats failed');
  }

  // Test 6: DELETE symptom log
  if (symptomLogId) {
    info('Test 6: DELETE /api/symptoms/:logId');
    const deleteResult = await request('DELETE', `/api/symptoms/${symptomLogId}`, {
      user_id: USER_ID,
    });
    if (deleteResult.success) {
      success('DELETE symptom log successful');
    } else {
      error('DELETE symptom log failed');
    }
  }
}

// =====================================================
// JOURNAL TESTS
// =====================================================

async function testJournalEndpoints() {
  section('Testing Journal Endpoints');

  // Test 1: POST create journal entry
  info('Test 1: POST /api/journal/entries');
  const createResult = await request('POST', '/api/journal/entries', {
    user_id: USER_ID,
    entry_date: today,
    content: 'This is a test journal entry. Today was challenging but I\'m learning to be kind to myself. I had some hot flashes and felt anxious, but I took time to rest and practice self-care.',
    mood_rating: 2,
  });
  if (createResult.success) {
    journalEntryId = createResult.data.entry?.id;
    success(`POST journal entry successful (ID: ${journalEntryId})`);
  } else {
    error('POST journal entry failed');
  }

  // Test 2: POST another entry (yesterday)
  info('Test 2: POST /api/journal/entries (yesterday)');
  const yesterdayResult = await request('POST', '/api/journal/entries', {
    user_id: USER_ID,
    entry_date: yesterday,
    content: 'Yesterday was a better day. I slept well and had more energy. Feeling grateful for the support from my friends.',
    mood_rating: 3,
  });
  if (yesterdayResult.success) {
    success('POST journal entry (yesterday) successful');
  } else {
    error('POST journal entry (yesterday) failed');
  }

  // Test 3: GET journal entries list
  info('Test 3: GET /api/journal/entries/:userId?limit=10');
  const listResult = await request('GET', `/api/journal/entries/${USER_ID}?limit=10`);
  if (listResult.success && listResult.data.entries?.length >= 1) {
    success(`GET journal entries successful (${listResult.data.entries.length} entries found)`);
  } else {
    error('GET journal entries failed');
  }

  // Test 4: GET single journal entry
  if (journalEntryId) {
    info(`Test 4: GET /api/journal/entry/${journalEntryId}?user_id=${USER_ID}`);
    const getResult = await request('GET', `/api/journal/entry/${journalEntryId}?user_id=${USER_ID}`);
    if (getResult.success && getResult.data.entry) {
      success('GET single journal entry successful');
    } else {
      error('GET single journal entry failed');
    }
  }

  // Test 5: PUT update journal entry
  if (journalEntryId) {
    info('Test 5: PUT /api/journal/entry/:entryId');
    const updateResult = await request('PUT', `/api/journal/entry/${journalEntryId}`, {
      user_id: USER_ID,
      content: 'UPDATED: This is an updated test journal entry. I added more thoughts about my day.',
      mood_rating: 3,
    });
    if (updateResult.success) {
      success('PUT journal entry successful');
    } else {
      error('PUT journal entry failed');
    }
  }

  // Test 6: GET search journal entries
  info('Test 6: GET /api/journal/search/:userId?q=grateful');
  const searchResult = await request('GET', `/api/journal/search/${USER_ID}?q=grateful`);
  if (searchResult.success) {
    success(`GET journal search successful (${searchResult.data.entries?.length || 0} results)`);
  } else {
    error('GET journal search failed');
  }

  // Test 7: GET journal stats
  info('Test 7: GET /api/journal/stats/:userId');
  const statsResult = await request('GET', `/api/journal/stats/${USER_ID}`);
  if (statsResult.success && statsResult.data.stats) {
    success('GET journal stats successful');
    info(`  Total entries: ${statsResult.data.stats.total_entries}`);
    info(`  Entries last 7 days: ${statsResult.data.stats.entries_last_7_days}`);
    if (statsResult.data.stats.avg_mood_rating) {
      info(`  Avg mood rating: ${statsResult.data.stats.avg_mood_rating}`);
    }
  } else {
    error('GET journal stats failed');
  }

  // Test 8: DELETE journal entry
  if (journalEntryId) {
    info('Test 8: DELETE /api/journal/entry/:entryId');
    const deleteResult = await request('DELETE', `/api/journal/entry/${journalEntryId}`, {
      user_id: USER_ID,
    });
    if (deleteResult.success) {
      success('DELETE journal entry successful');
    } else {
      error('DELETE journal entry failed');
    }
  }
}

// =====================================================
// MAIN TEST RUNNER
// =====================================================

async function runAllTests() {
  console.log('');
  log(colors.blue, '🧪 Free Tier API Endpoint Tests');
  log(colors.blue, '================================');
  info(`Testing API: ${API_URL}`);
  info(`User ID: ${USER_ID}`);
  console.log('');

  // Check if backend is running
  info('Checking if backend is running...');
  const healthCheck = await request('GET', '/api/health');
  if (!healthCheck.success) {
    error('Backend is not running!');
    error('');
    error('Please start the backend first:');
    error('  npm run dev:backend');
    error('');
    process.exit(1);
  }
  success('Backend is running!');

  // Run all tests
  await testProfileEndpoints();
  await testSymptomEndpoints();
  await testJournalEndpoints();

  // Summary
  section('Test Summary');
  success('All tests completed!');
  console.log('');
  info('Check the output above for any failed tests.');
  info('All endpoints with ✅ are working correctly.');
  console.log('');
}

// Run tests
runAllTests().catch((err) => {
  error(`Test script failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});

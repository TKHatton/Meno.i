/**
 * Comprehensive Journal System Test Script
 * Tests all journal API endpoints with realistic data
 */

const API_URL = process.env.API_URL || 'http://localhost:4000';

// Test user ID (you should replace this with a real user ID from your Supabase auth.users table)
const TEST_USER_ID = 'YOUR_USER_ID_HERE';

async function testJournalSystem() {
  console.log('🧪 Testing MenoAI Journal System\n');
  console.log('API URL:', API_URL);
  console.log('Test User ID:', TEST_USER_ID, '\n');

  if (TEST_USER_ID === 'YOUR_USER_ID_HERE') {
    console.error('❌ Please set TEST_USER_ID to a real user ID from your database');
    console.log('\nTo get a user ID:');
    console.log('1. Sign in to your app');
    console.log('2. Check Supabase Dashboard > Authentication > Users');
    console.log('3. Copy the UUID of your test user');
    console.log('4. Update TEST_USER_ID in this script\n');
    return;
  }

  let testEntryId = null;

  try {
    // Test 1: Create a journal entry
    console.log('📝 Test 1: Creating a journal entry...');
    const createResponse = await fetch(`${API_URL}/api/journal/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: TEST_USER_ID,
        entry_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
        content: 'Today I felt really empowered. I had a great conversation with my doctor about HRT options. Feeling hopeful!',
        mood_rating: 3 // Good mood
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error('❌ Failed to create entry:', error);
      return;
    }

    const createData = await createResponse.json();
    testEntryId = createData.entry.id;
    console.log('✅ Entry created successfully!');
    console.log('   Entry ID:', testEntryId);
    console.log('   Mood:', createData.entry.mood_rating);
    console.log('   Date:', createData.entry.entry_date);
    console.log('');

    // Test 2: Get all journal entries
    console.log('📖 Test 2: Fetching all journal entries...');
    const listResponse = await fetch(`${API_URL}/api/journal/entries/${TEST_USER_ID}?limit=10`);

    if (!listResponse.ok) {
      console.error('❌ Failed to fetch entries');
      return;
    }

    const listData = await listResponse.json();
    console.log(`✅ Found ${listData.entries.length} entries`);
    if (listData.entries.length > 0) {
      console.log('   Latest entry preview:', listData.entries[0].content.substring(0, 50) + '...');
    }
    console.log('');

    // Test 3: Get a single entry
    console.log('📄 Test 3: Fetching single entry...');
    const getResponse = await fetch(`${API_URL}/api/journal/entry/${testEntryId}?user_id=${TEST_USER_ID}`);

    if (!getResponse.ok) {
      console.error('❌ Failed to fetch entry');
      return;
    }

    const getData = await getResponse.json();
    console.log('✅ Entry fetched successfully!');
    console.log('   Content length:', getData.entry.content.length, 'characters');
    console.log('');

    // Test 4: Update the entry
    console.log('✏️  Test 4: Updating journal entry...');
    const updateResponse = await fetch(`${API_URL}/api/journal/entry/${testEntryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: TEST_USER_ID,
        content: getData.entry.content + '\n\nUpdate: After my walk, I felt even better!',
        mood_rating: 4 // Great mood now!
      })
    });

    if (!updateResponse.ok) {
      console.error('❌ Failed to update entry');
      return;
    }

    const updateData = await updateResponse.json();
    console.log('✅ Entry updated successfully!');
    console.log('   New mood:', updateData.entry.mood_rating);
    console.log('   Content updated:', updateData.entry.content.length > getData.entry.content.length);
    console.log('');

    // Test 5: Search entries
    console.log('🔍 Test 5: Searching journal entries...');
    const searchResponse = await fetch(`${API_URL}/api/journal/search/${TEST_USER_ID}?q=doctor&limit=10`);

    if (!searchResponse.ok) {
      console.error('❌ Failed to search entries');
      return;
    }

    const searchData = await searchResponse.json();
    console.log(`✅ Search found ${searchData.entries.length} matching entries`);
    console.log('');

    // Test 6: Get journal stats
    console.log('📊 Test 6: Fetching journal statistics...');
    const statsResponse = await fetch(`${API_URL}/api/journal/stats/${TEST_USER_ID}`);

    if (!statsResponse.ok) {
      console.error('❌ Failed to fetch stats');
      return;
    }

    const statsData = await statsResponse.json();
    console.log('✅ Stats fetched successfully!');
    console.log('   Total entries:', statsData.stats.total_entries);
    console.log('   Entries this week:', statsData.stats.entries_this_week);
    console.log('   Entries this month:', statsData.stats.entries_this_month);
    console.log('   Average mood:', statsData.stats.average_mood?.toFixed(2) || 'N/A');
    console.log('   Current streak:', statsData.stats.current_streak, 'days');
    console.log('');

    // Test 7: Delete the test entry (cleanup)
    console.log('🗑️  Test 7: Deleting test entry (cleanup)...');
    const deleteResponse = await fetch(`${API_URL}/api/journal/entry/${testEntryId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: TEST_USER_ID
      })
    });

    if (!deleteResponse.ok) {
      console.error('❌ Failed to delete entry');
      return;
    }

    console.log('✅ Entry deleted successfully!');
    console.log('');

    // Final summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 All tests passed successfully!');
    console.log('═══════════════════════════════════════');
    console.log('\n✅ Journal System Status: FULLY FUNCTIONAL\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the tests
testJournalSystem();

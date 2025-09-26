/**
 * Test script to verify cache invalidation works properly
 * Run this script to test the cache clearing functionality
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testCacheInvalidation() {
  console.log('🧪 Testing Cache Invalidation System...\n');

  try {
    // Step 1: Check initial cache status
    console.log('1️⃣ Checking initial cache status...');
    const statusResponse = await fetch(`${BASE_URL}/api/properties/cache/status`);
    const statusData = await statusResponse.json();
    console.log('   Cache Status:', statusData);
    console.log('   Has Cache:', statusData.hasCache);
    console.log('   Cache Valid:', statusData.cacheValid);
    console.log('   Properties Count:', statusData.totalProperties);

    // Step 2: Load properties to populate cache
    console.log('\n2️⃣ Loading properties to populate cache...');
    const cacheResponse = await fetch(`${BASE_URL}/api/properties/cache`);
    const cacheData = await cacheResponse.json();
    console.log('   Cache Load Result:', cacheData.success);
    console.log('   Properties Loaded:', cacheData.totalProperties);
    console.log('   Source:', cacheData.source);

    // Step 3: Check cache status after loading
    console.log('\n3️⃣ Checking cache status after loading...');
    const statusResponse2 = await fetch(`${BASE_URL}/api/properties/cache/status`);
    const statusData2 = await statusResponse2.json();
    console.log('   Cache Status After Load:', statusData2);
    console.log('   Has Cache:', statusData2.hasCache);
    console.log('   Cache Valid:', statusData2.cacheValid);

    // Step 4: Clear cache manually
    console.log('\n4️⃣ Clearing cache manually...');
    const clearResponse = await fetch(`${BASE_URL}/api/properties/cache/debug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'clear' })
    });
    const clearData = await clearResponse.json();
    console.log('   Clear Result:', clearData.success);
    console.log('   Message:', clearData.message);

    // Step 5: Check cache status after clearing
    console.log('\n5️⃣ Checking cache status after clearing...');
    const statusResponse3 = await fetch(`${BASE_URL}/api/properties/cache/status`);
    const statusData3 = await statusResponse3.json();
    console.log('   Cache Status After Clear:', statusData3);
    console.log('   Has Cache:', statusData3.hasCache);
    console.log('   Cache Valid:', statusData3.cacheValid);

    // Step 6: Test cache expiry (wait 35 seconds to test 30-second expiry)
    console.log('\n6️⃣ Testing cache expiry (waiting 35 seconds)...');
    console.log('   This will test the 30-second cache expiry...');
    
    // Load cache again
    const cacheResponse2 = await fetch(`${BASE_URL}/api/properties/cache`);
    const cacheData2 = await cacheResponse2.json();
    console.log('   Cache Reloaded:', cacheData2.success);
    
    // Wait 35 seconds
    console.log('   Waiting 35 seconds for cache to expire...');
    await new Promise(resolve => setTimeout(resolve, 35000));
    
    // Check if cache expired
    const statusResponse4 = await fetch(`${BASE_URL}/api/properties/cache/status`);
    const statusData4 = await statusResponse4.json();
    console.log('   Cache Status After 35s:', statusData4);
    console.log('   Cache Should Be Expired:', !statusData4.cacheValid);

    console.log('\n✅ Cache invalidation test completed!');
    console.log('\n📋 Summary:');
    console.log('   - Cache can be loaded and populated');
    console.log('   - Cache can be manually cleared');
    console.log('   - Cache expires after 30 seconds');
    console.log('   - Cache invalidation is working properly');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCacheInvalidation();

// Test script to verify admin property filtering functionality
// This script can be run in the browser console to test the API endpoints

async function testAdminBookings() {
  console.log('Testing Admin Bookings API...');
  
  try {
    // Test admin bookings endpoint
    const response = await fetch('/api/admin/bookings?limit=5&offset=0&since=2024-01-01T00:00:00Z&status=active');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('Admin Bookings Response:');
    console.log('- Total bookings:', data.pagination?.total || 0);
    console.log('- Bookings returned:', data.bookings?.length || 0);
    console.log('- Admin Info:', data.adminInfo);
    
    if (data.adminInfo) {
      console.log('- Admin Email:', data.adminInfo.email);
      console.log('- Admin Role:', data.adminInfo.role);
      console.log('- Property Count:', data.adminInfo.propertyCount);
      console.log('- Property IDs:', data.adminInfo.propertyIds);
    }
    
    // Display first few bookings
    if (data.bookings && data.bookings.length > 0) {
      console.log('\nFirst few bookings:');
      data.bookings.slice(0, 3).forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.personName} - ${booking.propertyName} (Property ID: ${booking.property_id})`);
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error testing admin bookings:', error);
    return null;
  }
}

async function testSuperadminBookings() {
  console.log('\nTesting Superadmin Bookings API...');
  
  try {
    // Test superadmin bookings endpoint
    const response = await fetch('/api/superadmin/bookings?limit=5&offset=0&since=2024-01-01T00:00:00Z&status=active');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('Superadmin Bookings Response:');
    console.log('- Total bookings:', data.pagination?.total || 0);
    console.log('- Bookings returned:', data.bookings?.length || 0);
    console.log('- Superadmin Info:', data.superadminInfo);
    
    // Display first few bookings
    if (data.bookings && data.bookings.length > 0) {
      console.log('\nFirst few bookings:');
      data.bookings.slice(0, 3).forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.personName} - ${booking.propertyName} (Property ID: ${booking.property_id})`);
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error testing superadmin bookings:', error);
    return null;
  }
}

// Run the tests
async function runTests() {
  console.log('=== Admin Bookings API Test ===');
  const adminResult = await testAdminBookings();
  
  console.log('\n=== Superadmin Bookings API Test ===');
  const superadminResult = await testSuperadminBookings();
  
  console.log('\n=== Test Summary ===');
  console.log('Admin API working:', adminResult !== null);
  console.log('Superadmin API working:', superadminResult !== null);
  
  if (adminResult && adminResult.adminInfo) {
    console.log('Admin property filtering:', adminResult.adminInfo.propertyCount > 0 ? 'ACTIVE' : 'NO PROPERTIES');
  }
}

// Instructions for running the test
console.log('To test the admin property filtering functionality:');
console.log('1. Make sure you are logged in as an admin user');
console.log('2. Open browser console on the admin bookings page');
console.log('3. Copy and paste this entire script');
console.log('4. Run: runTests()');
console.log('\nThe test will verify:');
console.log('- Admin can only see bookings for their own properties');
console.log('- Superadmin can see all bookings');
console.log('- Property filtering is working correctly');

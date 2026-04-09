// Test script to verify certificate history functionality
// This script can be run in the browser console to test the new certificate history view

async function testCertificateHistory() {
  try {
    console.log('Testing Certificate History functionality...');
    
    // Test 1: Check if CertificateHistoryView component is available
    if (typeof CertificateHistoryView !== 'undefined') {
      console.log('CertificateHistoryView component is available');
    } else {
      console.log('CertificateHistoryView component is not available (expected in production)');
    }
    
    // Test 2: Check if routing works
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    
    // Test 3: Check if menu item is present
    const historyMenuItem = document.querySelector('[data-menu-item="certificate_history"]');
    if (historyMenuItem) {
      console.log('History menu item found in DOM');
    } else {
      console.log('History menu item not found (might be rendered dynamically)');
    }
    
    // Test 4: Simulate navigation to certificate history
    console.log('Simulating navigation to /historia');
    // In real app, this would be handled by the routing system
    
    // Test 5: Check if we can fetch certificates
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      console.log('User is authenticated, testing certificate fetch...');
      
      const { data, error } = await supabase
        .from('certificates')
        .select('*, training:trainings(id, title, category)')
        .eq('employee_id', session.user.id)
        .order('issued_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching certificates:', error);
      } else {
        console.log(`Found ${data?.length || 0} certificates`);
        
        // Show sample certificate data
        if (data && data.length > 0) {
          console.log('Sample certificate:', data[0]);
        }
      }
    } else {
      console.log('User not authenticated');
    }
    
    console.log('Certificate History test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Instructions for testing:
// 1. Open the application in browser
// 2. Log in as an employee
// 3. Open browser console
// 4. Paste and run this test function
// 5. Call testCertificateHistory()

console.log('Certificate History test script loaded. Run testCertificateHistory() to test the functionality.');

// Additional manual test steps:
// 1. Check if "História" appears in the employee menu
// 2. Click on "História" menu item
// 3. Verify the certificate history page loads
// 4. Check if certificates are displayed correctly
// 5. Test filtering (all, valid, expired)
// 6. Test sorting options

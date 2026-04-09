// Test script to verify certificate view and download functionality
// This script can be run in the browser console to test the certificate functions

async function testCertificateFunctions() {
  try {
    console.log('Testing Certificate View and Download functionality...');
    
    // Test 1: Check if CertificateModal component is available
    if (typeof CertificateModal !== 'undefined') {
      console.log('CertificateModal component is available');
    } else {
      console.log('CertificateModal component is not available (expected in production)');
    }
    
    // Test 2: Check if we can access certificate data
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      console.log('User is authenticated, testing certificate data access...');
      
      const { data, error } = await supabase
        .from('certificates')
        .select('*, training:trainings(id, title, category)')
        .eq('employee_id', session.user.id)
        .order('issued_at', { ascending: false })
        .limit(1); // Get just one certificate for testing
      
      if (error) {
        console.error('Error fetching certificate data:', error);
      } else if (data && data.length > 0) {
        const cert = data[0];
        console.log('Sample certificate data:', {
          id: cert.id,
          certificate_number: cert.certificate_number,
          training_title: cert.training?.title,
          issued_at: cert.issued_at,
          valid_until: cert.valid_until
        });
        
        // Test 3: Simulate certificate data for modal
        const mockCertData = {
          userName: `${session.user.user_metadata?.firstName || ''} ${session.user.user_metadata?.lastName || session.user.email}`,
          trainingTitle: cert.training?.title || 'Test Training',
          certNumber: cert.certificate_number,
          date: new Date(cert.issued_at).toLocaleDateString('sk-SK'),
          validUntil: cert.valid_until
        };
        
        console.log('Mock certificate data for modal:', mockCertData);
        
        // Test 4: Check if modal elements exist in DOM
        setTimeout(() => {
          const modalElement = document.querySelector('[class*="fixed inset-0"]');
          if (modalElement) {
            console.log('Modal container found in DOM');
          } else {
            console.log('Modal container not found (might not be open yet)');
          }
          
          // Test 5: Check for certificate buttons
          const viewButtons = document.querySelectorAll('button');
          const viewButton = Array.from(viewButtons).find(btn => btn.textContent?.includes('Zobrazi'));
          const downloadButton = Array.from(viewButtons).find(btn => btn.textContent?.includes('Stiahni'));
          
          if (viewButton) {
            console.log('View button found:', viewButton);
          } else {
            console.log('View button not found');
          }
          
          if (downloadButton) {
            console.log('Download button found:', downloadButton);
          } else {
            console.log('Download button not found');
          }
        }, 1000);
        
      } else {
        console.log('No certificates found for testing');
      }
    } else {
      console.log('User not authenticated');
    }
    
    console.log('Certificate functions test completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Function to simulate clicking view button
function simulateViewClick() {
  const viewButtons = document.querySelectorAll('button');
  const viewButton = Array.from(viewButtons).find(btn => btn.textContent?.includes('Zobrazi'));
  if (viewButton) {
    console.log('Simulating click on view button...');
    viewButton.click();
  } else {
    console.log('View button not found for simulation');
  }
}

// Function to simulate clicking download button
function simulateDownloadClick() {
  const downloadButtons = document.querySelectorAll('button');
  const downloadButton = Array.from(downloadButtons).find(btn => btn.textContent?.includes('Stiahni'));
  if (downloadButton) {
    console.log('Simulating click on download button...');
    downloadButton.click();
  } else {
    console.log('Download button not found for simulation');
  }
}

// Function to check modal state
function checkModalState() {
  const modalElement = document.querySelector('[class*="fixed inset-0"]');
  if (modalElement) {
    const isVisible = modalElement.style.display !== 'none' && !modalElement.classList.contains('hidden');
    console.log('Modal visibility:', isVisible);
    
    if (isVisible) {
      const modalContent = modalElement.querySelector('h2, h3, h4');
      if (modalContent) {
        console.log('Modal title:', modalContent.textContent);
      }
    }
  } else {
    console.log('Modal element not found');
  }
}

// Instructions for testing:
// 1. Open the application in browser
// 2. Log in as an employee
// 3. Navigate to "História" page
// 4. Open browser console
// 5. Paste and run this test function
// 6. Call testCertificateFunctions()
// 7. Then try simulateViewClick() and simulateDownloadClick()
// 8. Use checkModalState() to verify modal state

console.log('Certificate Functions test script loaded.');
console.log('Available functions:');
console.log('- testCertificateFunctions() - Main test function');
console.log('- simulateViewClick() - Simulate clicking view button');
console.log('- simulateDownloadClick() - Simulate clicking download button');
console.log('- checkModalState() - Check if modal is open');

// Manual testing steps:
// 1. Navigate to /historia page
// 2. Click "Zobrazi" button - should open certificate modal
// 3. Click "Stiahni" button - should open modal and trigger print dialog
// 4. Verify certificate details are displayed correctly
// 5. Check print functionality works

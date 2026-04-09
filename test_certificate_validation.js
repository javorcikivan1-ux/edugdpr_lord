// Test script to verify certificate date validation
// This script can be run in the browser console to test the validation logic

function testCertificateValidation() {
  console.log('Testing certificate date validation...');
  
  // Test case 1: Normal case - valid dates
  const completedAt1 = new Date('2026-04-08T10:00:00Z');
  const validUntil1 = new Date('2026-10-08T10:00:00Z');
  
  console.log('Test 1 - Normal case:');
  console.log('Completed:', completedAt1.toISOString());
  console.log('Valid until:', validUntil1.toISOString());
  console.log('Is valid:', validUntil1 > completedAt1);
  console.log('---');
  
  // Test case 2: Edge case - same dates (should be invalid)
  const completedAt2 = new Date('2026-04-08T10:00:00Z');
  const validUntil2 = new Date('2026-04-08T10:00:00Z');
  
  console.log('Test 2 - Same dates (invalid):');
  console.log('Completed:', completedAt2.toISOString());
  console.log('Valid until:', validUntil2.toISOString());
  console.log('Is valid:', validUntil2 > completedAt2);
  console.log('---');
  
  // Test case 3: Invalid case - expiration before issue
  const completedAt3 = new Date('2026-04-08T10:00:00Z');
  const validUntil3 = new Date('2025-10-08T10:00:00Z');
  
  console.log('Test 3 - Invalid case (like your certificate):');
  console.log('Completed:', completedAt3.toISOString());
  console.log('Valid until:', validUntil3.toISOString());
  console.log('Is valid:', validUntil3 > completedAt3);
  
  // Simulate the validation logic from the code
  if (validUntil3 <= completedAt3) {
    console.log('Validation would catch this error!');
    const correctedValidUntil = new Date(completedAt3);
    correctedValidUntil.setMonth(correctedValidUntil.getMonth() + 6);
    console.log('Corrected valid until:', correctedValidUntil.toISOString());
  }
  
  console.log('---');
  console.log('Validation test completed!');
}

// Function to check if current validation logic would work
function simulateValidation() {
  console.log('Simulating current validation logic...');
  
  const completedAt = new Date().toISOString();
  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + 6);
  
  console.log('Current time:', new Date().toISOString());
  console.log('Completed at:', completedAt);
  console.log('Valid until:', validUntil.toISOString());
  
  // The validation check
  if (validUntil <= new Date(completedAt)) {
    console.log('ERROR: Validation would trigger!');
  } else {
    console.log('OK: Validation passes');
  }
}

console.log('Certificate validation test script loaded.');
console.log('Available functions:');
console.log('- testCertificateValidation() - Test various date scenarios');
console.log('- simulateValidation() - Simulate current validation logic');

// Instructions:
// 1. Open browser console
// 2. Paste and run this script
// 3. Call testCertificateValidation() to see test results
// 4. Call simulateValidation() to test current logic

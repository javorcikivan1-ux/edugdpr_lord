// Test script to verify document counting fix
// This script can be run in the browser console to test the getMyDocuments function

async function testDocumentCount() {
  try {
    console.log('Testing getMyDocuments function...');
    
    // Import the function (if running in Node.js environment)
    // const { getMyDocuments } = require('./lib/supabase');
    
    // For browser testing, the function should be available globally or imported
    const result = await getMyDocuments();
    
    console.log('Result:', result);
    
    if (result.error) {
      console.error('Error in getMyDocuments:', result.error);
      return;
    }
    
    const documents = result.data;
    console.log(`Total documents retrieved: ${documents.length}`);
    
    // Count by status
    const pendingCount = documents.filter(d => d.status === 'PENDING').length;
    const signedCount = documents.filter(d => d.status === 'SIGNED').length;
    
    console.log(`Pending documents: ${pendingCount}`);
    console.log(`Signed documents: ${signedCount}`);
    console.log(`Total counted: ${pendingCount + signedCount}`);
    
    // Check if we have documents from both tables
    const hasAssignedDocs = documents.some(d => d.document && d.document.id && !d.employee_id);
    const hasEmployeeDocs = documents.some(d => d.employee_id);
    
    console.log(`Has documents from assigned_documents table: ${hasAssignedDocs}`);
    console.log(`Has documents from employee_documents table: ${hasEmployeeDocs}`);
    
    // Sample a few documents to show structure
    console.log('Sample documents:');
    documents.slice(0, 3).forEach((doc, index) => {
      console.log(`Document ${index + 1}:`, {
        id: doc.id,
        title: doc.document?.title,
        status: doc.status,
        hasEmployeeId: !!doc.employee_id,
        created_at: doc.created_at
      });
    });
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Instructions for testing:
// 1. Open the application in browser
// 2. Log in as an employee
// 3. Open browser console
// 4. Paste and run this test function
// 5. Call testDocumentCount()

console.log('Test script loaded. Run testDocumentCount() to test the fix.');

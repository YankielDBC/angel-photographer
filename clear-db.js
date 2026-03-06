const { DynamoDBClient, ScanCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function clearAndCreate() {
  // Scan all bookings
  const scan = await docClient.send(new ScanCommand({ TableName: 'angel-bookings' }));
  const items = scan.Items || [];
  
  console.log('Found', items.length, 'bookings');
  
  // Delete all
  for (const item of items) {
    const id = typeof item.id === 'object' ? item.id.S : item.id;
    await docClient.send(new DeleteItemCommand({
      TableName: 'angel-bookings',
      Key: { id: { S: id } }
    }));
    console.log('Deleted:', id);
  }
  
  console.log('All bookings deleted!');
}

clearAndCreate().catch(console.error);

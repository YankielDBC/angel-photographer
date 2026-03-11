const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function cleanup() {
  // Scan for all blocked items
  const result = await docClient.send(new ScanCommand({
    TableName: 'angel-blocked'
  }));
  
  console.log('Current blocked items:', result.Items.length);
  
  // Delete all items with type 'day'
  for (const item of result.Items) {
    if (item.type.S === 'day') {
      console.log('Deleting day:', item.id.S);
      await docClient.send(new DeleteCommand({
        TableName: 'angel-blocked',
        Key: { id: item.id }
      }));
    }
  }
  
  console.log('Done! Days cleared, keeping slots only.');
}

cleanup().catch(console.error);

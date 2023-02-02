import { DynamoDB } from "aws-sdk";
import seedRandom from "seedrandom";

const dynamoDb = new DynamoDB.DocumentClient();

export async function getItems() {
  try {
    var seed = new Date().toDateString();

    const item = await dynamoDb.query({
      TableName: 'aws-assesment-cache',
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': seed
      }
    }).promise()

    if (item && item.Count && item.Count > 0 && item.Items) {

      return {
        statusCode: 200,
        body: item.Items[0].items,
      };
    }


    const params = {
      TableName: `aws-assesment`,
      ProjectionExpression: "id",
    } as AWS.DynamoDB.DocumentClient.QueryInput;
    const results = await dynamoDb.scan(params).promise();
    if (results) {
      const { Items, Count } = results;
      if (Items && Count) {
        const random1 = Math.ceil(seedRandom(seed)() * Count);
        const random2 = Math.ceil(seedRandom(seed + "a")() * Count);
        const random3 = Math.ceil(seedRandom(seed + "b")() * Count);
        const resp = [Items[random1], Items[random2], Items[random3]];

        await dynamoDb.put({
          TableName: 'aws-assesment-cache',
          Item: {
            id: seed,
            items: JSON.stringify(resp)
          }
        }).promise()

        return {
          statusCode: 200,
          body: JSON.stringify(resp),
        };
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (err) {
    console.log("exception in getItems lambda", err);
    return {
      statusCode: 400,
      body: JSON.stringify(err),
    };
  }
}


export async function putItems() {
  const data = []
  for (let i = 1; i < 10000; i++) {
    data.push({
      PutRequest: {
        Item: {
          "id": i.toString(),
          "name": `john-${i}`,
          "age": 21
        }
      }
    })
  }

  try {
    // saving items in chunks
    const chunkSize = 24;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
       await dynamoDb.batchWrite({
        RequestItems: {
          'aws-assesment': chunk
        }
      }).promise();
    }
    return { success: true, body: 'Data inserted successfully' };
  } catch (error: any) {
    console.log("exception in putItems lambda", error);
    return { success: false, error: error };
  }
}
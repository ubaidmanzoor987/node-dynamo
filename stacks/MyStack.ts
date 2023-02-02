import { Api, StackContext, Table, Function } from "@serverless-stack/resources";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";

export function MyStack({ stack }: StackContext) {
  // Create the table
  new Table(stack, "aws-assesment", {
    cdk: {
      table: {
        tableName: 'aws-assesment'
      }
    },
    fields: {
      id: "string",
      name: "string",
      age: "number",
    },
    primaryIndex: { partitionKey: "id" },
  });


  new Table(stack, "aws-assesment-cache", {
    cdk: {
      table: {
        tableName: 'aws-assesment-cache'
      }
    },
    fields: {
      id: "string",
      items: "string",
    },
    primaryIndex: { partitionKey: "id" },
  });

  const getRandomItemsLambda = new Function(stack, "get-random-items", {
    handler: "functions/lambda.getItems",
    functionName: 'get-items-lambda'
  })

  getRandomItemsLambda.addToRolePolicy(
    new PolicyStatement({
      actions: ['dynamodb:*'],
      effect: Effect.ALLOW,
      resources: ['*']
    })
  )

  const putItemsLambda = new Function(stack, "put-items", {
    handler: "functions/lambda.putItems",
    functionName: 'put-items-lambda'
  })

  putItemsLambda.addToRolePolicy(
    new PolicyStatement({
      actions: ['dynamodb:*'],
      effect: Effect.ALLOW,
      resources: ['*']
    })
  )

  // Create the HTTP API
  const api = new Api(stack, "Api", {
    routes: {
      "GET /items": getRandomItemsLambda,
      "POST /items": putItemsLambda,
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

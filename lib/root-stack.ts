import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {API} from "./api-construct";
import {DynamoDB} from "./dynamodb-construct";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class RootStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const standardClassTable = new DynamoDB(this, 'DynamoDBStandard')
        const standardIaClassTable = new DynamoDB(this, 'DynamoDBStandardIA')
        new API(this, 'API', {
            tableName: standardClassTable.tableName,
            tableArn: standardClassTable.arn
        });
    }
}

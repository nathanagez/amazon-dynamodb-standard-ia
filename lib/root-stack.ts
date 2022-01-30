import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import {Construct} from 'constructs';
import {Stack, StackProps} from 'aws-cdk-lib';
import {API} from "./api-construct";
import {DynamoDBTable} from "./dynamodb-construct";
import {DynamoDBStream} from "./dynamodb-stream-construct";


export class RootStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const standardClassTable = new DynamoDBTable(this, 'DynamoDBStandard')
        const standardIaClassTable = new DynamoDBTable(this, 'DynamoDBStandardIA', {
            // tableClass: dynamodb.TableClass.STANDARD_INFREQUENT_ACCESS, -> https://github.com/aws/aws-cdk/pull/18719
        })
        new API(this, 'API', {
            tableName: standardClassTable.table.tableName,
            tableArn: standardClassTable.table.tableArn,
        });
        new DynamoDBStream(this, 'StreamHandler', {
            tableName: standardIaClassTable.table.tableName,
            tableArn: standardIaClassTable.table.tableArn,
            tableStreamArn: standardClassTable.table.tableStreamArn,
            handler: 'stream-handler.put'
        });
    }
}

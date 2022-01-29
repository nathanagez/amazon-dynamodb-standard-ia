import {Construct} from "constructs";
import {StackProps} from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class DynamoDB extends Construct {
    public readonly tableName: string;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id);

        // TODO: Missing table class options (https://github.com/aws/aws-cdk/issues/18718)
        // Wait for this PR to be merged (https://github.com/aws/aws-cdk/pull/18719)
        const table = new dynamodb.Table(this, 'Table', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
            timeToLiveAttribute: "ttl",
        });
        this.tableName = table.tableName
    }
}
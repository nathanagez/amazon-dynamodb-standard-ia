import {Construct} from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import {TableProps} from "aws-cdk-lib/aws-dynamodb";

interface Props {
    tableClass?: string // tableClass: dynamodb.TableClass.STANDARD_INFREQUENT_ACCESS,
}

export class DynamoDBTable extends Construct {
    public readonly table: dynamodb.Table;

    constructor(scope: Construct, id: string, props?: Props) {
        super(scope, id);

        // TODO: Missing table class options (https://github.com/aws/aws-cdk/issues/18718)
        // Wait for this PR to be merged (https://github.com/aws/aws-cdk/pull/18719)
        this.table = new dynamodb.Table(this, 'Table', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
            timeToLiveAttribute: "ttl",
            ...props
        });
    }
}
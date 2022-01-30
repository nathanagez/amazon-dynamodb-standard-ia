import {Construct} from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";

interface Props {
    tableName: string;
    tableArn: string;
    tableStreamArn?: string;
    handler: string;
    resource?: string;
}

export class DynamoDBStream extends Construct {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        const dynamoDBPolicy = new iam.PolicyStatement({
            actions: [
                "dynamodb:PutItem",
            ],
            resources: [props.tableArn],
        });
        const dynamoDBStreamPolicy = new iam.PolicyStatement({
            actions: [
                "dynamodb:DescribeStream",
                "dynamodb:GetRecords",
                "dynamodb:GetShardIterator",
                "dynamodb:ListStreams",
            ],
            resources: [props.tableStreamArn || "*"],
        });

        const fn = new lambda.Function(this, 'RequestHandler', {
            code: lambda.Code.fromAsset(props?.resource || 'resource'),
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: props.handler,
            environment: {
                TABLE_NAME: props.tableName
            }
        });
        fn.role?.attachInlinePolicy(new iam.Policy(this, 'putItem', {
            statements: [dynamoDBPolicy, dynamoDBStreamPolicy]
        }))
        fn.role?.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName(
                'service-role/AWSLambdaBasicExecutionRole',
            ),
        );

        const source = new lambda.EventSourceMapping(this, 'EventSourceMapping', {
            target: fn,
            eventSourceArn: props.tableStreamArn,
            startingPosition: lambda.StartingPosition.TRIM_HORIZON,
            batchSize: 1,
        });

        const cfnSource = source.node.defaultChild as lambda.CfnEventSourceMapping;
        cfnSource.addPropertyOverride('FilterCriteria', {
            Filters: [
                {
                    Pattern: `{ \"eventName\": [\"REMOVE\"] }`,
                },
            ],
        });
    }
}
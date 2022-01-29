import * as lambda from "aws-cdk-lib/aws-lambda"
import * as apiGateway from "aws-cdk-lib/aws-apigateway"
import {Construct} from "constructs";
import {StackProps} from "aws-cdk-lib";

interface Props {
    tableName: string;
}

export class API extends Construct {
    // Lambda with HTTP Invocation params
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        // TODO: Add dynamodb:PutItem permissions
        const requestHandler = new lambda.Function(this, 'RequestHandler', {
            code: lambda.Code.fromAsset('resource'),
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'request-handler.put',
            environment: {
                TABLE_NAME: props.tableName
            }
        });

        const api = new apiGateway.LambdaRestApi(this, 'DynamoDB', {
            handler: requestHandler,
            proxy: false
        });
        const items = api.root.addResource('items')
        items.addMethod('POST')
    }
}
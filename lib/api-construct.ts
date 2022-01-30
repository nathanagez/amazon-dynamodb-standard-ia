import * as lambda from "aws-cdk-lib/aws-lambda"
import * as apiGateway from "aws-cdk-lib/aws-apigateway"
import * as iam from "aws-cdk-lib/aws-iam"
import {Construct} from "constructs";

interface Props {
    tableName: string;
    tableArn: string;
}

export class API extends Construct {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        // Permissions for our Lambda function to putItem in DynamoDB table
        const dynamoDBPolicy = new iam.PolicyStatement({
            actions: ['dynamodb:PutItem'],
            resources: [props.tableArn],
        });

        const requestHandler = new lambda.Function(this, 'RequestHandler', {
            code: lambda.Code.fromAsset('resource'),
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'request-handler.put',
            environment: {
                TABLE_NAME: props.tableName
            }
        });
        requestHandler.role?.attachInlinePolicy(new iam.Policy(this, 'putItem', {
            statements: [dynamoDBPolicy]
        }))
        requestHandler.role?.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName(
                'service-role/AWSLambdaBasicExecutionRole',
            ),
        );

        const api = new apiGateway.LambdaRestApi(this, 'DynamoDB', {
            handler: requestHandler,
            proxy: false
        });
        const apiIntegration = new apiGateway.LambdaIntegration(requestHandler);
        const items = api.root.addResource('items')
        const itemModel = new apiGateway.Model(this, "model-validator", {
            restApi: api,
            contentType: "application/json",
            description: "To validate the request body",
            modelName: "itemModel",
            schema: {
                type: apiGateway.JsonSchemaType.OBJECT,
                required: ["details"],
                properties: {
                    details: {
                        type: apiGateway.JsonSchemaType.STRING
                    }
                }
            },
        });
        items.addMethod('POST', apiIntegration, {
            requestValidator: new apiGateway.RequestValidator(
                this,
                "body-validator",
                {
                    restApi: api,
                    requestValidatorName: "body-validator",
                    validateRequestBody: true,
                }
            ),
            requestModels: {
                "application/json": itemModel,
            }
        })
    }
}
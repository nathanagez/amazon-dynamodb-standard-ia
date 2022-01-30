const crypto = require('crypto')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient();
const REQUIRED_ENVS = ["TABLE_NAME"]

const put = async (event) => {
    const missing = REQUIRED_ENVS.filter((env) => !process.env[env])
    if (missing.length)
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    console.log(`EVENT: ${JSON.stringify(event, null, 2)}`)

    try {
        const [{dynamodb: {OldImage: deletedItem}}] = event.Records;
        const uuid = crypto.randomBytes(8).toString('hex')
        const item = {
            id: uuid,
            archive: deletedItem
        }
        const params = {
            TableName: process.env.TABLE_NAME,
            Item: item
        };
        return dynamo.put(params).promise();
    } catch (e) {
        throw new Error(e);
    }
}

module.exports = {
    put
}
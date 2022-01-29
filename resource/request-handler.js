const crypto = require('crypto')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient();
const REQUIRED_ENVS = ["TABLE_NAME"]
const ONE_MINUTE_IN_SEC = 60;

const response = (statusCode, body) => {
    return {
        statusCode,
        body
    }
}

const put = async (event) => {
    const missing = REQUIRED_ENVS.filter((env) => !process.env[env])
    if (missing.length)
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    console.log(`EVENT: ${JSON.stringify(event, null, 2)}`)

    try {
        const {details} = JSON.parse(event.body);
        console.log("DETAILS", details)
        const uuid = crypto.randomBytes(8).toString('hex')
        const date = new Date();
        const seconds = date.setSeconds(date.getSeconds() + ONE_MINUTE_IN_SEC);
        const ttl = Math.floor(seconds / 1000);
        const item = {
            id: uuid,
            details,
            ttl
        }

        const params = {
            TableName: process.env.TABLE_NAME,
            Item: item
        };

        console.log("PARAMS", params);
        const {item: insertedItem} = await dynamo.put(params).promise();
        console.log("ITEM", insertedItem)

        return response(200, JSON.stringify(insertedItem, null, 2))
    } catch (e) {
        return response(500, e.toString())
    }
}

module.exports = {
    put
}
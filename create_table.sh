aws dynamodb create-table \
    --table-name PURecords \
    --attribute-definitions \
        AttributeName=PULocationID,AttributeType=N \
        AttributeName=PUTime,AttributeType=N \
    --key-schema AttributeName=PULocationID,KeyType=HASH AttributeName=PUTime,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=2

aws dynamodb create-table \
    --table-name DORecords \
    --attribute-definitions \
        AttributeName=DOLocationID,AttributeType=N \
        AttributeName=DOTime,AttributeType=N \
    --key-schema AttributeName=DOLocationID,KeyType=HASH AttributeName=DOTime,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=2

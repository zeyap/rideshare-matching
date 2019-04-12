aws dynamodb create-table \
    --table-name depRecords \
    --attribute-definitions \
        AttributeName=depRegionID,AttributeType=N \
        AttributeName=depTime,AttributeType=N \
    --key-schema AttributeName=depRegionID,KeyType=HASH AttributeName=depTime,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=1

aws dynamodb create-table \
    --table-name arrRecords \
    --attribute-definitions \
        AttributeName=destRegionID,AttributeType=N \
        AttributeName=arrTime,AttributeType=N \
    --key-schema AttributeName=destRegionID,KeyType=HASH AttributeName=arrTime,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=1

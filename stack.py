#%%
import logging
import json
from pathlib import Path
import boto3

logger = logging.getLogger('PostDeploy')

def get_api_id():
    client = boto3.client('cloudformation')

    response = client.describe_stack_resources(
        StackName='TttStaging',
        
    )

    apiGW, = [x for x in response['StackResources'] if x['ResourceType'] == 'AWS::ApiGatewayV2::Api']

    api_id = apiGW['PhysicalResourceId']
    return api_id
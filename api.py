#%%
import logging
import json
from pathlib import Path
import boto3

logger = logging.getLogger('PostDeploy')

apic = boto3.client('apigatewayv2')
apis = apic.get_apis().get('Items')
# api, = [x for x in apis if x['Name'] == deployment['stackname']]
# api_id = api['ApiId']
apis
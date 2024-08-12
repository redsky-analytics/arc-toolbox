#%%
import arc
import os
import json
from pathlib import Path
import boto3


def get_api_id_from_deployment_file():
    deployment = json.loads(Path('deployment.json').read_text())
    apic = boto3.client('apigatewayv2')
    apis = apic.get_apis().get('Items')
    api, = [x for x in apis if x['Name'] == deployment['stackname']]
    api_id = api['ApiId']
    return api_id


def get_lambdas_for_stack(stackName):
  client = boto3.client('cloudformation')
  response = client.describe_stack_resources(
      StackName=stackName,
  )
  lambdas = [x for x in response['StackResources'] if x['ResourceType'] == 'AWS::Lambda::Function']
  
  return lambdas


stackName = 'TttStaging'
client = boto3.client('cloudformation')
response = client.describe_stack_resources(
      StackName=stackName,
  )

response['StackResources']
deployment = json.loads(Path('deployment.json').read_text())
lambdas = get_lambdas_for_stack(stackName)

exp_arc = {}
for lamb in lambdas:
    arc_name = deployment['cloudformation']['Resources'][lamb['LogicalResourceId']]['ArcMetadata']['name']
    exp_arc[arc_name] = lamb

exp_arc
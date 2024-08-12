import arc
from pathlib import Path
import json
import boto3
import os


def get_api_id_for_stack(stackName):
  client = boto3.client('cloudformation')
  response = client.describe_stack_resources(
      StackName=stackName,
  )
  apiGW, = [x for x in response['StackResources'] if x['ResourceType'] == 'AWS::ApiGatewayV2::Api']
  api_id = apiGW['PhysicalResourceId']
  return api_id


def handler(req, context):
  stackName = os.environ['ARC_STACK_NAME']
  api_id = get_api_id_for_stack(stackName)
  apic = boto3.client('apigatewayv2')
  response = apic.export_api(
    ApiId=api_id, 
    OutputType = 'JSON',
    Specification='OAS30'
  )
  result = arc.http.res(
      req,
      {
        "cors": True,
        "json": json.loads(Path('openapi-specs.json').read_text())
      }
    )

  return result
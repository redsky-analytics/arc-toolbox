#%%
import logging
import json
from pathlib import Path
import boto3
import os
import subprocess

logger = logging.getLogger('PostDeploy')


def get_api_id_for_stack(stackName):
  client = boto3.client('cloudformation')
  response = client.describe_stack_resources(
      StackName=stackName,
  )
  apiGW, = [x for x in response['StackResources'] if x['ResourceType'] == 'AWS::ApiGatewayV2::Api']
  api_id = apiGW['PhysicalResourceId']
  return api_id


def get_api_id_from_deployment_file():
    deployment = json.loads(Path('deployment.json').read_text())
    apic = boto3.client('apigatewayv2')
    apis = apic.get_apis().get('Items')
    api, = [x for x in apis if x['Name'] == deployment['stackname']]
    api_id = api['ApiId']
    return api_id


def update_api_gateway_athorizer():
    
    api_id = get_api_id_from_deployment_file()
    apic = boto3.client('apigatewayv2')
    authorizers = apic.get_authorizers(ApiId=api_id)
    authorizer, = authorizers['Items']
    authorizer_id = authorizer['AuthorizerId']

    routes = apic.get_routes(ApiId=api_id).get('Items')
    noAuthPaths = []
    authPaths = []

    deployment = json.loads(Path('deployment.json').read_text())
    deployedAuthorization = {}
    for noAuthEntry in deployment['arc'].get('noauth'):
        routePath = ' '.join(noAuthEntry).lower()
        noAuthPaths.append(routePath)

    for httpEntry in deployment['arc'].get('http'):
        httpPath = ' '.join(httpEntry).lower()
        if httpPath not in noAuthPaths:
            authPaths.append(httpPath)


    for routePath in noAuthPaths:
        try:        
            route, = [x for x in routes if x['RouteKey'].replace('{', '').replace('}', '').lower() == routePath.lower()]
            routeId = route['RouteId']
            deployedAuthorization[routePath] = {
                'routeId':routeId,
                'authorizer': route['AuthorizationType'],
                'expectedAuthorizer': 'NONE',
            }
        except Exception as ex:
            logger.warning(f'RouteId not found for path: {routePath}')


    for routePath in authPaths:
        try:        
            route, = [x for x in routes if x['RouteKey'].replace('{', '').replace('}', '').lower() == routePath.lower()]
            routeId = route['RouteId']
            deployedAuthorization[routePath] = {
                'routeId':routeId,
                'authorizer': route['AuthorizationType'],
                'expectedAuthorizer': 'JWT',
            }
        except Exception as ex:
            logger.warning(f'RouteId not found for path: {routePath}')

    for routePath in deployedAuthorization:
        routeDeployment = deployedAuthorization[routePath]
        if routeDeployment['authorizer'] != routeDeployment['expectedAuthorizer']:
            print(f'fix {routePath}')
            route_id = routeDeployment['routeId']        
            apic.update_route(ApiId=api_id, RouteId=route_id, AuthorizationType=routeDeployment['expectedAuthorizer'], AuthorizerId=authorizer_id)



def get_openapi_specs():
    api_id = get_api_id_from_deployment_file()
    apic = boto3.client('apigatewayv2')
    response = apic.export_api(
      ApiId=api_id, 
      OutputType = 'JSON',
      Specification='OAS30'
    )
    
    Path('src/http/get-openapi_specs/openapi-specs.json').write_text(json.dumps(json.loads(response['body'].read())))
    # os.system('npx arc deploy --direct src/http/get-openapi_specs --no-hydrate')
    try:
        subprocess.run("npx arc deploy --direct src/http/get-openapi_specs --no-hydrate", shell=True, check=True)
    except:
        pass

if __name__ == '__main__':
    print('Performing post deploy step.')
    update_api_gateway_athorizer()
    get_openapi_specs()
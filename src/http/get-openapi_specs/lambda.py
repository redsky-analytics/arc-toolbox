import arc
from pathlib import Path
import json
import boto3

# learn more about HTTP functions here: https://arc.codes/http
def handler(req, context):
  api_id = get_api_id()
  apic = boto3.client('apigatewayv2')
  response = apic.export_api(
    ApiId=api_id, 
    OutputType = 'JSON',
    Specification='OAS30'
  )
  return arc.http.res(
      req,
      {
        "cors": True,
        "json": json.loads(Path('openapi-specs.json').read_text())
      }
    )


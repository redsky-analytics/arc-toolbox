import os
import arc
# learn more about HTTP functions here: https://arc.codes/http
def handler(req, context):
    return arc.http.res(
    req,
    {
      "cors": True,
      "json": {"status": "ok",
              "result": os.environ['auth_config']
             },
    }
  )
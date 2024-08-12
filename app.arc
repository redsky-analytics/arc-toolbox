@app
ttt

@plugins
abc2

@crud
/collections
/collection/:cid/items

@http
get /p1


@tables

collections
  cid *String

items
  cid *String
  iid **String

@table-index
collections
  name

items
  name

@aws
runtime python3.12
region us-east-1

@auth

@noauth
get /_static/proxy+
get /proxy+
get /auth-config
get /openapi-specs

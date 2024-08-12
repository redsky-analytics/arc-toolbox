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
  uid *String
  cid **String

items
  cid *String
  iid **String

@aws
runtime python3.12
region us-east-1


@auth

@noauth
get /_static/proxy+
get /proxy+
get /auth-config
get /openapi-specs


@app
ttt

@plugins
abc2

@crud
/collections
/collection/:cid/items

@http
get /p1


@table
collections
  cid

items
  cid  
  iid

@table-index
collections
    name

items
    name

@aws
runtime python3.12
@auth
firebase LOC-A2232
ui-path /connect

@config
{}

@noauth
/docs
/config

@doc
/doc

@transfer
location data
ud /collection/:cid uploads/:email/collections/:cid/data
ud /collection/:cid/item/:iid uploads/:email/collections/:cid/items/:iid/data

@crud
/collection
/collection/:cid/item

@admin
/admin


@metrics-table
metrics

@userpilot


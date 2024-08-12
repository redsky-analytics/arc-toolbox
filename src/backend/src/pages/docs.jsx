import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

// https://github.com/swagger-api/swagger-ui/issues/5584
export const Docs = () => <SwaggerUI url="openapi-specs" />
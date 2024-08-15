import { Title } from "react-admin"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

// https://github.com/swagger-api/swagger-ui/issues/5584
export const DocsPage = () => <div>
    <Title title="API Documentaation"/>
    <SwaggerUI url="openapi-specs" />
</div>
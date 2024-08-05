
import { writeFileSync } from "fs";
// let { join } = require('path')

const JSONToFile = (obj, filename) =>
  writeFileSync(`${filename}.json`, JSON.stringify(obj, null, 2));


function splitStrings([key, value]) {
  if (typeof value === 'string') {
    return [key, value.split(',')];
  }

  return [key, value];
}

function getApiName(cfn) {
  return Object.keys(cfn.Resources).find(
    (resource) => cfn.Resources[resource].Type === "AWS::Serverless::HttpApi"
  );
}

function getConfig(arc) {
  const defaultConfig = {
    issuer: "",
    audience: [],
    scopes: [],
    identitySource: "$request.header.Authorization",
    default: false,
  };

  return {
    ...defaultConfig,
    ...Object.fromEntries(arc.jwt.map((setting) => splitStrings(setting))),
  };
}

function getCorsConfig(arc) {
  const defaultConfig = {
    maxAge: 600,
    allowCredentials: false,
    allowOrigins: ['*'],
    allowHeaders: [
      'Content-Type',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
      'x-requested-with',
    ],
    allowMethods: ['*'],
    exposeHeaders: [],
  };



  return {
    ...defaultConfig,
    ...Object.fromEntries(arc.cors.map((setting) => splitStrings(setting))),
  };
}


function findRoutes(cfn) {
  function isApi(resource) {
    return resource.Type === 'AWS::Serverless::Function';
  }

  function hasHttpEvent(resource, lambdaName) {
    const name = lambdaName.substring(0, lambdaName.length - "Lambda".length);
    return (
      resource.Properties &&
      resource.Properties.Events &&
      Object.keys(resource.Properties.Events).length > 0 &&
      Object.keys(resource.Properties.Events).includes(`${name}Event`) &&
      resource.Properties.Events[`${name}Event`].Type === 'HttpApi'
    );
  }

  return Object.keys(cfn.Resources)
    .filter((resource) => isApi(cfn.Resources[resource]))
    .filter((resource) => hasHttpEvent(cfn.Resources[resource], resource));
}

export const set = {
  /**
   * Pragmas
   */
  // @events
  // events: ({ arc, inventory }) => {
  //   return {
  //     name: 'my-event',
  //     src: join('path', 'to', 'code'),
  //   }
  // },
  // @queues
  // queues: ({ arc, inventory }) => {
  //   return {
  //     name: 'my-queue',
  //     src: join('path', 'to', 'code'),
  //   }
  // },
  // @http
  // http: ({ arc, inventory }) => {
  //   return {
  //     method: 'get',
  //     path: '/*'
  //     src: join('path', 'to', 'code'),
  //   }
  // },
  // @scheduled
  // scheduled: ({ arc, inventory }) => {
  //   return {
  //     name: 'my-scheduled-event',
  //     src: join('path', 'to', 'code'),
  //     rate: '1 day', // or...
  //     cron: '* * * * * *',
  //   }
  // },
  // @tables-streams
  // 'tables-streams': ({ arc, inventory }) => {
  //   return {
  //     name: 'my-table-stream',
  //     table: 'app-data',
  //     src: join('path', 'to', 'code'),
  //   }
  // },
  // Custom / bare Lambdas (with event sources to be defined by `deploy.start`)
  // customLambdas: ({ arc, inventory }) => {
  //   return {
  //     name: 'my-custom-lambda',
  //     src: join('path', 'to', 'code'),
  //   }
  // },
  /**
   * Resources
   */
  // Environment variables
  env: ({ arc, inventory }) => {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Setting Env');
    return {
      MY_ENV_VAR: 'ok',
      ANOTHER_VAR: { objects_and_arrays_are_automatically_json_encoded: 'neat!' }
    };
  },
  // Custom runtimes
  // runtimes: ({ arc, inventory }) => {
  //   return {
  //     name: 'runtime-name',
  //     type: 'transpiled',
  //     build: '.build',
  //     baseRuntime: 'nodejs14.x',
  //   }
  // },
};
export const deploy = {
  // Pre-deploy operations
  start: async ({ arc, cloudformation, dryRun, inventory, stage }) => {
    // Run operations prior to deployment
    // Optionally return mutated `cloudformation`
    console.log("START >>>>>>>>>>>>>>>>>", cloudformation);
    const apiName = getApiName(cloudformation);
    const config = getConfig(arc);
    const httpApi = cloudformation.Resources[apiName];

    // https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis-oauth2-authorizer.html
    httpApi.Properties.Auth = {
      Authorizers: {
        OAuth2Authorizer: {
          AuthorizationScopes: config.scopes,
          JwtConfiguration: {
            issuer: config.issuer,
            audience: config.audience,
          },
          IdentitySource: config.identitySource,
        },
      },
    };


    httpApi.Properties.Auth.DefaultAuthorizer = 'OAuth2Authorizer';


    const corsConfig = getCorsConfig(arc);
    cloudformation.Resources[apiName].Properties.CorsConfiguration = {
      AllowOrigins: corsConfig.allowOrigins,
      AllowHeaders: corsConfig.allowHeaders,
      ExposeHeaders: corsConfig.exposeHeaders,
      AllowMethods: corsConfig.allowMethods,
      MaxAge: corsConfig.maxAge,
    };

    if (corsConfig.allowOrigins[0] !== '*') {
      cfn.Resources[apiName].Properties.CorsConfiguration.AllowCredentials = corsConfig.allowCredentials;
    }

    console.log('START ROUTES --------------');

    for (const resource of findRoutes(cloudformation)) {
      const shortName = resource.substring(0, resource.length - "Lambda".length);
      const pathToCode = cloudformation.Resources[resource].Properties.CodeUri;
      console.log('P2C>>>>>>>>', pathToCode);

      const config = true;
      if (config !== false) {
        // cloudformation.Resources[resource].Properties.Events[`${shortName}Event`].Properties['Auth'] = {Authorizer: 'OAuth2Authorizer', AuthorizationType: 'JWT'};
        // cloudformation.Resources[resource].Properties.Events[`${shortName}Event`].Properties['Authorizer'] = 'OAuth2Authorizer';
        cloudformation.Resources[resource].Properties.Events[`${shortName}Event`].Properties['AuthorizationType'] = 'NONE';

        console.log('<<<', cloudformation.Resources[resource].Properties.Events[`${shortName}Event`]);
      }
    }

    console.log('END ROUTES --------------');

  },

  // Architect service discovery and config data
  // services: async ({ arc, cloudformation, dryRun, inventory, stage }) => {
  //   return {
  //     'service-name': 'value or ARN', // Register a service, or...
  //     'arbitrary-data': '...' // Add up to 4KB of arbitrary data / config as a string
  //   }
  // },
  // Alternate deployment targets
  // target: async ({ arc, cloudformation, dryRun, inventory, stage }) => {
  //   // Deploy to a target other than AWS (e.g. Begin, Serverless Cloud, etc.)
  //   console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Deploy other target')
  //   // return {'target1':'t1abc'}
  // },
  // Post-deploy operations
  end: async (params) => {
    // Run operations after to deployment
    const { arc, cloudformation, dryRun, inventory, stage } = params;


    JSONToFile(cloudformation, 'cloudformation');
    JSONToFile(arc, 'arc');
    JSONToFile(inventory, 'inventory');

    //     aws apigatewayv2 update-route \
    //  --api-id api-id  \
    //  --route-id route-id  \
    //  --authorization-type JWT \
    //  --authorizer-id authorizer-id \
    //  --authorization-scopes user.email 
    console.log(">>>>>>>>>>>>>>>>>", params);
  },
};
export const sandbox = {
  // Startup operations
  // start: async ({ arc, inventory, invoke }) => {
  //   // Run operations upon Sandbox startup
  // },
  // Project filesystem watcher
  // watcher: async ({ filename, event, inventory, invoke }) => {
  //   // Act on filesystem events within your project
  // },
  // Shutdown operations
  // end: async ({ arc, inventory, invoke }) => {
  //   // Run operations upon Sandbox shutdown
  // },
};

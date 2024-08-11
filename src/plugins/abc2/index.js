const fs = require('fs')
let { spawnSync } = require('child_process')


const JSONToFile = (obj, filename) =>
  fs.writeFileSync(`${filename}.json`, JSON.stringify(obj, null, 2));

const ConfigFromJSON = (filename) =>
  JSON.parse(fs.readFileSync(`${filename}.json`))


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

function getAuthConfig(arc) {

  if (arc.auth) {
    
    const authSettings = ConfigFromJSON('firebase-auth')
    const firebaseProjectName = authSettings['projectId']

    return {
      issuer: `https://securetoken.google.com/${firebaseProjectName}`,
      audience: firebaseProjectName,
      scopes: [],
      identitySource: "$request.header.Authorization"
    };
  }

  return null
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

  if (arc.cors) {
    return {
      ...defaultConfig,
      ...Object.fromEntries(arc.cors.map((setting) => splitStrings(setting))),
    };
  }

  return {
    ...defaultConfig
  };
  
}


module.exports = {
  // Setters
  set: {
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

    static: ({ arc, inventory }) => {
      return {
        fingerprint: true,
        spa: true,
        folder: 'src/backend/dist'
      }
    },

    tables: ({ arc, inventory }) => {
      return {
        name: 'system',
        partitionKey: 'sid',
        partitionKeyType: 'string',
      }
    },



    // @http
    http: ({ arc, inventory }) => {
      return {
        method: 'get',
        path: '/auth-config',
        src: 'src/http/get-auth_config',
      }
    },

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

      const envs = {
        MY_ENV_VAR: 'ok',
        ANOTHER_VAR: { objects_and_arrays_are_automatically_json_encoded: 'neat!' }
      };

      const authConfig = getAuthConfig(arc)

      if (authConfig) {
        const firebaseConfig = ConfigFromJSON('firebase-auth');
        envs['auth_config'] = firebaseConfig
      }

      return envs
      
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
  },

  // Deploy
  deploy: {
    // Pre-deploy operations
    start: async ({ arc, cloudformation, dryRun, inventory, stage }) => {
      // Run operations prior to deployment
      // Optionally return mutated `cloudformation`
      
      const apiName = getApiName(cloudformation);
      const authConfig = getAuthConfig(arc);
      const httpApi = cloudformation.Resources[apiName];

      // authorization
      if (authConfig) {
        // https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis-oauth2-authorizer.html
        httpApi.Properties.Auth = {
          Authorizers: {
            OAuth2Authorizer: {
              AuthorizationScopes: authConfig.scopes,
              JwtConfiguration: {
                issuer: authConfig.issuer,
                audience: [authConfig.audience],
              },
              IdentitySource: authConfig.identitySource,
            },
          },
        };
        httpApi.Properties.Auth.DefaultAuthorizer = 'OAuth2Authorizer';
      }
      
      // CORS
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


      //Deploy backend
      const { status, stdout, output } = spawnSync('yarn', ['build'], { shell: true, cwd: 'src/backend' })
      
      if (status) {
        console.error(output.toString())
        throw Error('Error deploying backend')
      }
  
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
    // },

    // Post-deploy operations
    end: async ({ arc, cloudformation, dryRun, inventory, stage, aws, stackname }) => {
      console.log('stackname', stackname)
      // Run operations after to deployment
      // console.log(Object.keys(params));
      // console.log('XXXXXXXX', params['aws'])
      // const { arc, cloudformation, dryRun, inventory, stage, aws, stackname } = params;
  
      JSONToFile({ arc, cloudformation, dryRun, inventory, stage, stackname }, 'deployment');
  
      //     aws apigatewayv2 update-route \
      //  --api-id api-id  \
      //  --route-id route-id  \
      //  --authorization-type JWT \
      //  --authorizer-id authorizer-id \
      //  --authorization-scopes user.email 
      // console.log(">>>>>>>>>>>>>>>>>", params.aws);
    },
  },

  // Sandbox
  sandbox: {
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
  }
}

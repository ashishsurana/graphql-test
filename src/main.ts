import * as express from 'express';
import * as bodyParser from 'body-parser';
import {graphqlExpress, graphiqlExpress} from 'graphql-server-express';
import { Schema } from './graphql/schema';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as morgan from 'morgan';

//Set process title
process.title = 'moku-server'

process.on('SIGINT', function onSigInt () {  
  console.info('Got SIGINT. Graceful shutdown start', new Date().toISOString())
  // start graceul shutdown here
  shutdown()
})

// Default port or given one.
export const GRAPHQL_ROUTE = "/graphql";
export const GRAPHIQL_ROUTE = "/graphiql";

interface IMainOptions {
  enableCors: boolean;
  enableGraphiql: boolean;
  env: string;
  port: number;
  baseUrl: string;
  verbose?: boolean;
}

/* istanbul ignore next: no need to test verbose print */
function verbosePrint(port, enableGraphiql) {
  console.log(`GraphQL Server is now running on http://localhost:${port}${GRAPHQL_ROUTE}`);
  if (true === enableGraphiql) {
    console.log(`GraphiQL Server is now running on http://localhost:${port}${GRAPHIQL_ROUTE}`);
  }
}

let server;

export function main(options: IMainOptions) {
  let app = express();
  
  app.use(helmet());
  
  app.use(morgan(options.env));
  
  if (true === options.enableCors) {
    app.use(GRAPHQL_ROUTE, cors());
  }
  
  app.use(GRAPHQL_ROUTE, bodyParser.json(), graphqlExpress({
    context: {env : options.env},
    schema: Schema,
  }));
  
  if (true === options.enableGraphiql) {
    app.use(GRAPHIQL_ROUTE, graphiqlExpress({endpointURL: options.baseUrl + GRAPHQL_ROUTE}));
  }
  
  return new Promise((resolve, reject) => {
    server = app.listen(options.port, () => {
      /* istanbul ignore if: no need to test verbose print */
      if (options.verbose) {
        verbosePrint(options.port, options.enableGraphiql);
      }
      
      resolve(server);
    }).on("error", (err: Error) => {
      reject(err);
    });
  });
}

/* istanbul ignore if: main scope */
if (require.main === module) {
  const BASE_URL = process.env.BASE_URL || '';
  console.log("GRAPHQL BASE URL for NGINX: ", BASE_URL);
  const PORT = process.env.PORT || 3000;
  
  // Either to export GraphiQL (Debug Interface) or not.
  const NODE_ENV = process.env.NODE_ENV !== "production" ? "dev" : "production";
  
  const EXPORT_GRAPHIQL = NODE_ENV !== "production";
  
  // Enable cors (cross-origin HTTP request) or not.
  const ENABLE_CORS = NODE_ENV !== "production";
  
  main({
    enableCors: ENABLE_CORS,
    enableGraphiql: EXPORT_GRAPHIQL,
    env: NODE_ENV,
    port: PORT,
    baseUrl: BASE_URL,
    verbose: true,
  });
}

//Shutdown when kill signal received
function shutdown() {  
  server.close();
  process.exit(0);
}

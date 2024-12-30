import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Pet Agenda API",
    description: "Everything on you pet schedule!",
  },
  host: "localhost:3000",
};

const outputFile = "./swagger-output.json";
const routes = ["../server.ts"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc);

import { MyStack } from "./MyStack";
import { App } from "@serverless-stack/resources";

export default function (app: App) {
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
    timeout: 900,
    srcPath: "services",
    bundle: {
      format: "esm",
    },
  });
  app.stack(MyStack);
}


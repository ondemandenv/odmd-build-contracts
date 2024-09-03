import * as neo4j from "neo4j-driver";

import {CdkGraph} from "./cdk-graph";
import {App} from "aws-cdk-lib";
import {CloudAssembly} from "aws-cdk-lib/cx-api";
import {Config} from "neo4j-driver/types/driver";

export async function tmpTst(app: App, csa: CloudAssembly) {

    let config: Config | undefined = {
        logging: {
            level: 'debug', logger: (level, message) => {
                switch (level) {
                    case 'debug':
                        console.debug(message);
                        break;
                    case 'info':
                        console.info(message);
                        break;
                    case 'warn':
                        console.warn(message);
                        break;
                    case 'error':
                        console.error(message);
                        break;
                    default:
                        console.log(level, message);
                }
            }
        }
    };


    let localApiPort = '7688';
    const driver = neo4j.driver('bolt://localhost:' + localApiPort, undefined, config)

    const grph = new CdkGraph(driver, app, csa, [])

    await grph.buildConstructGraph(false)

}

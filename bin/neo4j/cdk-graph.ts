import {App} from "aws-cdk-lib";
import {Driver, Session} from "neo4j-driver";
import {CloudAssembly} from "aws-cdk-lib/cx-api";
import {App2Node} from "./lib/nodes-construct-cfn";
import {GraphConstructCfn} from "./lib/graph-construct-cfn";

export interface ExtendingGraph {
    extClasses: [Function, Function][]

    buildGraph(root: App2Node, session: Session, csa: CloudAssembly): Promise<void>;
}

export class CdkGraph {
    public readonly n4jDriver: Driver;
    public readonly app: App;
    public readonly csa: CloudAssembly;

    // private databaseName: string;
    public readonly constructRoot: App2Node;
    public readonly extends: ExtendingGraph[];


    constructor(n4jDriver: Driver, app: App, csa: CloudAssembly, exts: ExtendingGraph[]) {
        this.n4jDriver = n4jDriver
        this.app = app
        this.csa = csa
        this.extends = exts

        this.constructRoot = new App2Node(this.app, this.csa, {
            extClasses: exts.map(e => e.extClasses).flat(),
            ignoreClasses: ['TreeMetadata'] as string[]
        });
    }


    private getFakeN4jSession() {
        return new Proxy(this.n4jDriver.session(), {
            get(target, prop, receiver) {
                if (prop === 'executeWrite') {
                    return async (transactionWork: any) => {
                        transactionWork({
                            run(tx: any) {
                                // console.log(' dry run==>>>>' + tx)
                            }
                        })
                    };
                }
                return Reflect.get(target, prop, receiver);
            },
        })
    }

    public async buildConstructGraph(dryRun: boolean = true) {
        const session = dryRun ? this.getFakeN4jSession() : this.n4jDriver.session();

        const constr = new GraphConstructCfn(session, this.app, this.csa)
        try {
            await constr.treeWalk(this.constructRoot)
            await constr.wireRefs(this.constructRoot)
        } finally {
            await session.close()
        }
    }
}

//MATCH (a)-[r:cross_ref_to]->(b) match (a)-[*1..1]-(fn) match(b)-[*1..1]-(tn)  return a,b,fn,tn
import {IConstruct} from "constructs";
import {App} from "aws-cdk-lib";
import {CloudAssembly} from "aws-cdk-lib/cx-api";
import {Session} from "neo4j-driver";
import {App2Node, Construct2Node} from "./nodes-construct-cfn";
import {ContractsCrossRefProducer} from "../../../lib/odmd-model/contracts-cross-refs";


export class GraphConstructCfn {
    private root: App2Node;
    private session: Session;


    constructor(session: Session, app: App, csa: CloudAssembly) {
        this.root = new App2Node(app, csa)
        this.session = session
    }

    async treeWalk(node: Construct2Node<IConstruct>) {
        const {propsStrArr, propsParam} = GraphConstructCfn.getPropsCypherStrs(node);

        await this.session.executeWrite(tx => {
            let labels = node.labels.map(l => l.replace(/[^a-zA-Z0-9]/g, '_')).join(':');
            if (labels == '') labels = node.classesNames.find(c => c != '')!.replace(/[^a-zA-Z0-9]/g, '_')
            tx.run(`CREATE (a:${labels}{
                
                ${propsStrArr.join(',\n')}
                
                })`, propsParam)
        })


        if (node.parent) {
            await this.session.executeWrite(tx => {
                tx.run(`MATCH( p ), ( c )
                    
                    where p.path = $p and c.path = $c
                    
                    CREATE (p)-[r:own]->(c)
                    RETURN r`, {p: node.parent!.path, c: node.path});
            })
        }


        if (node.children.length > 0) {
            for (const child of node.children) {
                await this.treeWalk(child)
            }
        }

    }

    public static getPropsCypherStrs(node: Construct2Node<IConstruct>, char: ':' | '=' = ':') {
        const propsStrArr = new Array<string>();
        const propsParam = {} as { [k: string]: string | string[] }
        for (const name in node.properties) {
            if (node.properties[name]) {
                propsStrArr.push(`${name}${char} $${name}`)
                propsParam[name] = node.properties[name]!
            }
        }
        return {propsStrArr, propsParam};
    }


    public readonly errors: Error[] = []


    async wireRefs(node: Construct2Node<IConstruct>) {
        if (node.cdkElement instanceof ContractsCrossRefProducer) {

            for (const c of node.cdkElement.consumers.keys()) {
                await this.session.executeWrite(tx => {
                    tx.run(` match(p), (c)
                    where p.path="${node.path}" and c.path="${c.node.path}"
                    
                    CREATE (c)-[r:consuming]->(p)
                    `)
                })
            }
        }

        for (const c of node.children) {
            await this.wireRefs(c);
        }
    }

}
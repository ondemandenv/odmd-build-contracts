import {IConstruct} from "constructs";
import {App} from "aws-cdk-lib";
import {CloudAssembly} from "aws-cdk-lib/cx-api";
import {ContractsCrossRefProducer} from "../../../lib/odmd-model/contracts-cross-refs";
import {ContractsBuild} from "../../../lib/odmd-model/contracts-build";
import {ContractsEnver} from "../../../lib/odmd-model/contracts-enver";
import {ContractsEnverCdk} from "../../../lib/odmd-model/contracts-enver-cdk";

export class Construct2Node<T extends IConstruct> {

    public static getClasses(f: Function) {
        const rt = [] as Function[]
        while (f && f != Object && f.prototype) {
            rt.push(f)
            f = Object.getPrototypeOf(f.prototype)?.constructor
        }
        return rt
    }

    public static getClassesNames(f: Function) {
        return this.getClasses(f).map(f => f.name)
    }

    public readonly cdkElement: T;
    public readonly parent: Construct2Node<IConstruct> | undefined


    public findNodeByPath(path: string): Construct2Node<IConstruct> | undefined {
        if (this.path == path) {
            return this;
        }
        for (const c of this.children) {
            const rt = c.findNodeByPath(path);
            if (rt)
                return rt
        }
        return
    }


    constructor(construct: T, parent?: Construct2Node<IConstruct>) {
        this.cdkElement = construct;
        this.parent = parent
        this._id = this.cdkElement.node.id
        this._path = this.cdkElement.node.path

        this._classesNames = Construct2Node.getClassesNames(this.cdkElement.constructor)
        if (!App2Node.constructor2Nodes.has(this.constructor)) {
            App2Node.constructor2Nodes.set(this.constructor, [])
        }
        App2Node.constructor2Nodes.get(this.constructor)!.push(this)

        const scClasses = this.cdkElement.node.scopes.map(sc => sc.constructor.name).join('/')

        this._properties = {id: this.id, path: this.path, scClasses, classesNames: this.classesNames};

        this._labels = [];

        if (construct instanceof ContractsCrossRefProducer) {
            this.properties['name'] = construct.name
        } else if (construct instanceof ContractsBuild) {
            this.labels.push("Build")
            this.properties['id'] = construct.buildId
        } else if (construct instanceof ContractsEnver) {
            this.labels.push("Enver")
            this.properties['targetRevision'] = construct.targetRevision.toPathPartStr()

            if (construct instanceof ContractsEnverCdk) {
                this.labels.push("EnverCDK")
                this.properties['stacks'] = construct.getRevStackNames()
            }
        }


        this._children = this.cdkElement.node.children.filter(
            c => App2Node.ignoreClasses.find(ic => ic == c.constructor.name) == undefined
        ).map(c => {
            if (App2Node.constructor2class) {
                const extClass = App2Node.constructor2class.find(
                    ff => c instanceof ff[0])?.[1]
                // ff => ff[0] == c.constructor)?.[1]
                if (extClass) {
                    let rt: any
                    try {
                        // @ts-ignore
                        rt = new extClass(c, this)
                    } catch (e) {
                        console.error(e)
                    }
                    if (rt instanceof Construct2Node)
                        return rt;
                    throw new Error('Ext class error:' + extClass.name + ' is not a Construct2Node')
                }
            }

            return new Construct2Node(c, this)
        })
    }

    private _id: string;
    private _path: string;
    private _labels: string[];
    private _classesNames: string[];


    get id(): string {
        return this._id;
    }

    get path(): string {
        return this._path;
    }

    get labels(): string[] {
        return this._labels
    }

    get classesNames(): string[] {
        return this._classesNames;
    }

    protected _properties: { [key: string]: string | string[] }
    public get properties(): { [key: string]: string | string[] | undefined } {
        return this._properties
    }

    private _children: Construct2Node<IConstruct>[]
    public get children(): Construct2Node<IConstruct>[] {
        return this._children
    }


}


export class App2Node extends Construct2Node<App> {


    private static _cloudAssembly: CloudAssembly
    public static get cloudAssembly(): CloudAssembly {
        return App2Node._cloudAssembly
    }

    //App2Node._constructor2class = options?.extClasses in constructor
    private static _constructor2class: [Function, Function][] | undefined
    public static get constructor2class(): [Function, Function][] | undefined {
        return App2Node._constructor2class
    }

    private static _ignoreClasses: string[] = []
    public static get ignoreClasses(): string[] {
        return this._ignoreClasses
    }

    //line73, built on fly, App2Node.constructor2Nodes.get(this.constructor)!.push(this)
    private static _constructor2Nodes: Map<Function, Construct2Node<IConstruct>[]> = new Map<Function, Construct2Node<IConstruct>[]>()
    public static get constructor2Nodes(): Map<Function, Construct2Node<IConstruct>[]> {
        return this._constructor2Nodes
    }

    constructor(construct: App, csa: CloudAssembly, options?: {
        extClasses?: [Function, Function][],
        ignoreClasses?: string[]
    }) {
        App2Node._cloudAssembly = csa
        App2Node._constructor2class = options?.extClasses
        if (options?.ignoreClasses) {
            App2Node._ignoreClasses = options.ignoreClasses
        }
        super(construct);
    }

    get id(): string {
        return '-';
    }

    get path(): string {
        return '-';
    }
}

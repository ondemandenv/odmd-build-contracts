import {Construct} from "constructs";
import * as crypto from 'crypto';
import {AnyContractsEnVer} from "./contracts-enver";
import {OndemandContracts} from "../OndemandContracts";
import {ContractsShareIn} from "./contracts-share-values";
import {Stack} from "aws-cdk-lib";

export class ContractsCrossRefProducer<T extends AnyContractsEnVer> extends Construct {
    constructor(owner: T, id: string, name?: string) {
        super(owner, id)
        this._consumers = new Map<ContractsCrossRefConsumer<AnyContractsEnVer, T>, Set<string>>()
        this.name = name ?? id
        if (this.name.includes('/')) {
            throw new Error(`ref producer's name can't contain /, got ${this.name}`)
        }
    }

    readonly name: string

    get owner(): T {
        return this.node.scope as T
    }

    get consumers(): Map<ContractsCrossRefConsumer<AnyContractsEnVer, T>, Set<string>> {
        return this._consumers;
    }

    private readonly _consumers: Map<ContractsCrossRefConsumer<AnyContractsEnVer, T>, Set<string>>
}

export class ContractsCrossRefConsumer<C extends AnyContractsEnVer, P extends AnyContractsEnVer> extends Construct {

    constructor(scope: C, id: string, producer: ContractsCrossRefProducer<P>, options: {
        defaultIfAbsent: any,
        triggerOnChange: boolean//trigger consumer stack deployment on change
    } = {triggerOnChange: true, defaultIfAbsent: '__dummy'}) {
        super(scope, id);
        if (!producer.consumers.has(this)) {
            producer.consumers.set(this, new Set())
        }
        const bySet = producer.consumers.get(this)!
        if (bySet.has(this.node.path)) {
            throw new Error("exist already:" + this.node.path)
        }
        bySet.add(this.node.path)
        this._producer = producer
        this._options = options
    }

    public get owner(): C {
        return this.node.scope as C
    }

    private readonly _producer: ContractsCrossRefProducer<P>;
    public get producer(): ContractsCrossRefProducer<P> {
        return this._producer
    }

    private readonly _options: {
        defaultIfAbsent: any,
        triggerOnChange: boolean//trigger consumer stack deployment on change
    } | undefined = undefined

    public get options() {
        return this._options
    }

    public toOdmdRef(): string {
        return `${ContractsCrossRefConsumer.OdmdRef_prefix}\${${this.node.path}}`
    }

    public static readonly OdmdRef_prefix = 'OdmdRefConsumer: ';

    /**
     *
     * @param s  `${ContractsCrossRefConsumer.OdmdRef_prefix}\${${this.node.path}}`
     * @param s  "OdmdRefConsumer: ${a/b/c}"
     *
     */
    public static fromOdmdRef(s: string): ContractsCrossRefConsumer<AnyContractsEnVer, AnyContractsEnVer> {

        if (!s.startsWith(this.OdmdRef_prefix + "${")) {
            throw new Error('Only OdmdRefConsumer')
        }

        const tmp = s.substring(this.OdmdRef_prefix.length + 2)
        const targetPath = tmp.substring(0, tmp.indexOf("}"));

        for (const b of OndemandContracts.inst.odmdBuilds) {
            const f = b.node.findAll().find(e => e.node.path == targetPath)
            if (f) {
                return f as ContractsCrossRefConsumer<AnyContractsEnVer, AnyContractsEnVer>;
            }
        }
        throw new Error('/')

    }


    private static readonly _sharingIns: Map<string, ContractsShareIn> = new Map<string, ContractsShareIn>();


    public getSharedValue(stack: Stack): string {
        const key = OdmdNames.create(this._producer.owner, stack.stackName);
        if (!ContractsCrossRefConsumer._sharingIns.has(key)) {
            ContractsCrossRefConsumer._sharingIns.set(key, new ContractsShareIn(stack, this.owner.owner.buildId, [this]))
        } else {
            ContractsCrossRefConsumer._sharingIns.get(key)!.addRefProducer(this)
        }
        return ContractsCrossRefConsumer._sharingIns.get(key)!.getShareValue(this._producer);
    }

}


export class OdmdNames {

    constructor(constru: Construct) {
        this.constru = constru;
    }

    readonly constru: Construct;

    maxLength: number = 256;
    separator: string = '';
    allowedSpecialCharacters: string = '';
    varName?: string;

    public generate() {
        const regex = new RegExp(this.allowedSpecialCharacters ? `[^A-Za-z0-9${this.allowedSpecialCharacters}]` : '[^A-Za-z0-9]', 'g');

        const orgPath = this.constru.node.scopes.map(s => s.node.id).join(this.separator) + this.varName ?? '';
        const orgRpl = orgPath.replace(regex, '')

        if (orgRpl.length > this.maxLength) {

            let md5 = OdmdNames.md5hash(orgPath);
            while (/^\d$/.test(md5.charAt(0))) {
                md5 = md5.substring(1) + md5.charAt(0);
            }
            return md5.substring(0, this.maxLength);
        }

        return orgRpl
    }

    public static create(constr: Construct, varName: string = '', max: number = 63): string {
        return new (class extends OdmdNames {
            varName = varName;
            maxLength = max
        })(constr).generate()
    }


    private static _impl: undefined | ((x: string) => string);

    public static md5hash(x: string) {
        if (!this._impl) {
            crypto.createHash('md5');
            this._impl = (x: string): string => {
                const hash = crypto.createHash('md5');
                hash.update(x);
                return hash.digest('hex');
            };
        }
        return this._impl(x);
    }

}
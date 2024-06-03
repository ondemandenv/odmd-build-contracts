import {Construct} from "constructs";
import {CustomResource, Fn, Stack} from "aws-cdk-lib";
import {ContractsCrossRefProducer} from "./contracts-cross-refs";
import {OndemandContracts} from "../OndemandContracts";
import {AnyContractsEnVer} from "./contracts-enver";

export function GET_SHARE_THRU_SSM_PROVIDER_NAME(ownerBuildId: string, ownerRegion: string, ownerAccount: string) {
    //The Name field of every Export member must be specified and consist only of alphanumeric characters, colons, or hyphens.
    return `odmd-ctl-${ownerBuildId}-${ownerRegion}-${ownerAccount}:share-thru-ssm-provider`.replace(/[^a-zA-Z0-9:-]/g, '-');
}

export class ContractsShareIn extends Construct {

    private readonly _refProducers: ContractsCrossRefProducer<AnyContractsEnVer>[]
    private readonly _cs: CustomResource
    private readonly _rtData: { [name: string]: string } = {}

    constructor(scope: Stack, consumerBuildId: string, refProducers: ContractsCrossRefProducer<AnyContractsEnVer>[]) {
        super(scope, 'odmd-share-in' + consumerBuildId + refProducers[0].owner.targetRevision);

        let tmp: AnyContractsEnVer | undefined = undefined;
        refProducers.forEach(p => {
            if (tmp != undefined && tmp != p.owner) {
                throw new Error(`One shareIn's refProducers have to share one enver but you have two: ${tmp.node.path} <=>${p.owner.node.path}`)
            }
            tmp = p.owner
        })
        const prdcrEnvr = tmp! as AnyContractsEnVer;
        this._refProducers = refProducers;

        const serviceToken = Fn.importValue(GET_SHARE_THRU_SSM_PROVIDER_NAME(consumerBuildId, scope.region, scope.account));

        this._cs = new CustomResource(this, 'share-in-values', {
            serviceToken,
            resourceType: 'Custom::InputFromCentralSSM',
            properties: {
                from_build_id: prdcrEnvr.owner.buildId,
                from_target_rev: prdcrEnvr.targetRevision,
                share_names: 'throw error now!'
            }
        })
        this.refresh();
    }

    //todo: this is directly used by cdk build, how to find out the consumers using the producer?
    private refresh() {
        const shareNameArr = this._refProducers.map(p => p.name);
        shareNameArr.forEach(en => {
            this._rtData[en] = this._cs.getAttString(en)
        })

        // @ts-ignore
        this._cs.resource._cfnProperties.share_names = shareNameArr.join()
    }

    public addRefProducer(refProducer: ContractsCrossRefProducer<AnyContractsEnVer>) {
        if (!this._refProducers.includes(refProducer)) {
            if (this._refProducers[0].owner != refProducer.owner) {
                throw new Error(`One shareIn's refProducers have to share enver but you have two: ${this._refProducers[0].owner.node.path} <=>${refProducer.owner.node.path}`)
            }
            this._refProducers.push(refProducer);
            this.refresh()
        }
    }

    /*
        * const handler = {
        get(target: any, prop: string) {
            if (prop in target) {
                return target[prop];
            } else {
                throw new Error(`Property ${prop} does not exist.`);
            }
        }
    };

    const createSafeObject = <T extends object>(obj: T): T => {
        return new Proxy(obj, handler);
    };

    // Example usage
    const myObject = { a: 1, b: 2 };
    const safeObject = createSafeObject(myObject);

    console.log(safeObject.a); // works fine, prints 1
    console.log(safeObject.c); // throws an error
    */
    public getShareValue(refProducer: ContractsCrossRefProducer<AnyContractsEnVer>) {
        return this._rtData[refProducer.name]
    }
}

export class ContractsShareOut extends Construct {

    constructor(scope: Stack, refToVal: Map<ContractsCrossRefProducer<AnyContractsEnVer>, any>) {
        super(scope, 'odmd-share-out');

        if (refToVal.size == 0) {
            throw new Error("odmd-share-out input size is 0 can't proceed !")
        }

        let tmp: AnyContractsEnVer | undefined = undefined;
        let refProducers = Array.from(refToVal.keys());
        refProducers.forEach(p => {
            if (tmp != undefined && tmp != p.owner) {
                throw new Error(`One shareOut can only have one enver but you have two: ${tmp.node.path} <=>${p.owner.node.path}`)
            }
            tmp = p.owner
        })
        const produEnvr = tmp! as AnyContractsEnVer;

        refProducers.reduce((p, v) => {
            if (p.has(v.name)) {
                throw new Error("Multiple ref producer name conflict:" + v.name)
            }
            p.set(v.name, v)
            return p;
        }, new Map<string, ContractsCrossRefProducer<AnyContractsEnVer>>)


        const serviceToken = Fn.importValue(GET_SHARE_THRU_SSM_PROVIDER_NAME(produEnvr.owner.buildId, scope.region, scope.account));

        const properties = {} as { [n: string]: string | number }

        if (refProducers.find(p => p.name == 'ServiceToken')) {
            throw new Error("ServiceToken is reserved for OdmdShareOut")
        }

        const found = refProducers.find(p => p.name == OndemandContracts.REV_REF_name);
        if (found) {
            throw new Error(`${found.name} is reserved for OdmdShareOut`)
        }
        refToVal.forEach((val, ref) => {
            if (properties[ref.name]) {
                throw new Error(`share name: ${ref.name} is already used,val: ${properties[ref.name]}`)
            }
            properties[ref.name] = val
        })

        if (scope.account == OndemandContracts.inst.accounts.central) {
            throw new Error("OdmdShareOut is not for central")
        }
        if (!process.env[OndemandContracts.REV_REF_name]) {
            throw new Error("OdmdShareOut is for")
        }

        properties[OndemandContracts.REV_REF_name] = produEnvr.targetRevision.toString()

        new CustomResource(this, 'share-values', {
            serviceToken,
            resourceType: 'Custom::OutputToCentralSSM',
            properties
        })
    }
}

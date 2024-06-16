/**
 * Provided interface to be used by central service, copied from ODMD_REPO to app repo
 * Single implementation with only one single export under config/apps folder for loading dynamically
 * then copy to ODMD_REPO for fall back
 *
 * todo: validation in ODMD app lib
 * todo: compare with app repo definition regularly
 *
 * do not change unless you are sure!
 */

import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Construct, Node} from "constructs";
import {AnyContractsEnVer, ContractsEnver} from "./contracts-enver";
import {ContractsEnverCdk} from "./contracts-enver-cdk";
import {ContractsEnverContainerimg} from "./contracts-enver-containerImg";
import {ContractsEnverNpm} from "./contracts-enver-npm";

type CentralConfigConstr = new (...args: any[]) => ContractsBuild<AnyContractsEnVer>;


export type GithubRepo = {
    owner: string
    repo: string
    ghAppInstallID: number
}

// export abstract class OdmdBuild<T extends OdmdEnVerConfig> extends Construct {
export abstract class ContractsBuild<T extends ContractsEnver<ContractsBuild<T>>> extends Construct {

    static readonly CENTRAL_TO_INST = new Map<CentralConfigConstr, ContractsBuild<AnyContractsEnVer>>();

    static getInst(this: CentralConfigConstr): ContractsBuild<AnyContractsEnVer> {
        return ContractsBuild.CENTRAL_TO_INST.get(this)!
    }

    constructor(scope: Construct, id: string) {
        super(scope, id);
        this.buildId = id
        if (ContractsBuild.CENTRAL_TO_INST.has(this.constructor as CentralConfigConstr)) {
            throw new Error(`duplicate singleton: ${this.constructor.name}/${id}`)
        }
        ContractsBuild.CENTRAL_TO_INST.set(this.constructor as CentralConfigConstr, this)
    }


    private _dynamicEnvers: Array<T>
    public get dynamicEnvers(): Array<T> {
        return this._dynamicEnvers;
    }

    public refreshDynamicEnvers(rrefs: SRC_Rev_REF[]) {
        this._dynamicEnvers = rrefs.map(rrf => {
            if (!rrf.origin) {
                throw new Error(`buildId ${this.buildId}, see ref:${rrf.toString()} has no origin!`)
            }
            const orgEnver = this.envers.find(e => e.targetRevision.toString() == rrf.origin)
            if (!orgEnver) {
                throw new Error(`buildId ${this.buildId}, see ref:${rrf.toString()} can't find origin! with$${rrf.origin}`)
            }
            return orgEnver.generateDynamicEnver(rrf) as T
        })
    }

    public readonly buildId: string

    abstract readonly gitHubRepo: GithubRepo

    /**
     * Configurations will be used by ODMD pipelines will NOT be overridden:
     *
     * 1) 1st element's region is primary region and should NOT be changed.
     * 2) 1st element's branch is primary branch and should NOT be changed.
     *
     * this means implementation
     */
    abstract readonly envers: Array<T>

    readonly workDirs?: Array<string>

    /**
     * notification
     */
    abstract readonly ownerEmail?: string

    /**
     * will be used for IAM
     */
    readonly canonicalPath?: string[]


    /**
     * extra permissions to build this app( running cdk deploy <stack1> <stack2> )
     * todo: is it necessary to move it into OdmdEnVerConfig, so that each branch/env
     * can have different role.
     */
    readonly extraBuildStatement?: PolicyStatement[]


    private getPathToRoot(obj: T): object[] {
        const path = [];
        while (obj) {
            path.push(obj);
            obj = Object.getPrototypeOf(obj);
        }
        return path.reverse()
    }

    public getEnverCommonAncestor() {
        const paths = this.envers.filter(e =>
            e.targetRevision.origin == undefined).map(this.getPathToRoot)
        const shortestPathLength = Math.min(...paths.map(path => path.length));

        let i = 0;
        for (; i < shortestPathLength; i++) {
            const currentClasses = paths.map(path => path[i].constructor);
            if (!currentClasses.every(cls => cls === currentClasses[0])) {
                break;
            }
        }

        let rt = paths[0][i - 1]!.constructor!;
        while (rt) {
            const n = ContractsBuild.SUPPORTED_ENVER_CLASSES.find(c => {
                return c == rt
            })
            if (n) {
                return n
            }
            rt = Object.getPrototypeOf(rt)
            console.log(rt)
        }

        return rt
    }

    static SUPPORTED_ENVER_CLASSES = [
        ContractsEnverCdk, ContractsEnverContainerimg, ContractsEnverNpm
    ]
}


export class SRC_Rev_REF {
    constructor(type: "b" | "t" | "r", value: string, origin: string | undefined = undefined) {
        this.type = type;
        this.value = value;
        if (value.includes(':') || value.includes('@')) {
            throw new Error('n/a')
        }
        if (origin) {
            if (origin.includes('@')) {
                throw new Error(`Illegal origin: ${origin}, origin can't have origin`)
            }
        }
        this.origin = origin
    }

    // readonly type: "branch" | "tag" | "revision"
    readonly type: "b" | "t" | "r"
    readonly value: string
    readonly origin: string | undefined

    toString() {
        return this.type + ':' + this.value + (this.origin ? `@${this.origin}` : '');
    }
}
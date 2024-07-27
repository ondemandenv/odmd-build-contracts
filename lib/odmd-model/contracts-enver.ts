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

import {Construct, IConstruct} from "constructs";
import {Stack} from "aws-cdk-lib";
import {ContractsShareIn} from "./contracts-share-values";
import {OndemandContracts} from "../OndemandContracts";
import {ContractsBuild, SRC_Rev_REF} from "./contracts-build";
import {ContractsCrossRefProducer, OdmdNames} from "./contracts-cross-refs";

// type CentralConfigConstr = new (...args: any[]) => ContractsBuild<AnyContractsEnVer>;
//
// export type GitHubRepo = { owner: string, repo: string, odmdGhAppInstallationID?: number };

export interface IContractsEnver extends IConstruct {

    readonly targetAWSAccountID: string;
    readonly targetAWSRegion: string
    readonly targetRevision: SRC_Rev_REF


    get owner(): ContractsBuild<AnyContractsEnVer>

    readonly ephemeral: boolean
    readonly overwriteGhWf: boolean
    // readonly sharingIns: Map<string, ContractsShareIn>

    // getSharedValue(stack: Stack, refProducer: ContractsCrossRefProducer<AnyContractsEnVer>): string

    readonly centralRoleName: string
    readonly centralRolePath: string
    readonly centralRoleArn: string

    readonly buildRoleName: string
    readonly buildRolePath: string
    readonly buildRoleArn: string

    generateDynamicEnver(org: SRC_Rev_REF): IContractsEnver

}


/**
 * configurations required by odmd central, for a specific branch/env/version
 */
export abstract class ContractsEnver<T extends ContractsBuild<ContractsEnver<T>>> extends Construct implements IContractsEnver {


    readonly owner: T


    constructor(owner: T, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetRevision.toPathPartStr());
        this.owner = owner;
        this.targetAWSAccountID = targetAWSAccountID;
        this.targetAWSRegion = targetAWSRegion;
        this.targetRevision = targetRevision;
    }

    readonly description?: string

    /**
     * this branch/environment will be deployed to specific account and region,
     * stacknames are generated by singleton AppInfraConfig.getBranchStackNames
     */
    readonly targetAWSAccountID: string;
    readonly targetAWSRegion: string


    /**
     * branch name, revision or tag
     */
    readonly targetRevision: SRC_Rev_REF;


    /**
     * auto delete all ?
     */
    readonly ephemeral: boolean = true

    /**
     * do system overwrite user changed GhWf?
     */
    readonly overwriteGhWf: boolean = false


    /**
     * usually Cdk generate logical id based on stackname and resource id, which is good enough.
     * this method is when user want to define customize a resource's logical/physical name,
     * to make the name depend on branch/enver so that they don't conflict when deploying in
     * same scope
     *
     * @param originalName original resource name
     */
    //todo: add regex check for different kinds
    // public genDynamicName(originalName: string) {
    //     if (process.env.SRC_BRANCH == this.baseBranch) {
    //         return originalName
    //     }
    //     return originalName + '_' + process.env.SRC_BRANCH
    // } use OdmdNames.create with enver


    public get centralRoleName(): string {
        return `${this.owner.buildId}-${this.targetAWSRegion}${this.targetAWSAccountID}-centerRole`
    }

    public get centralRolePath(): string {
        return `/${this.owner.buildId}/`
    }

    public get centralRoleArn(): string {
        return `arn:aws:iam::${OndemandContracts.inst.accounts.central}:role${this.centralRolePath}${this.centralRoleName}`;
    }

    public get buildRoleName(): string {
        return `${this.owner.buildId}-${this.targetAWSRegion}${this.targetAWSAccountID}-buildRole`;
    }

    public get buildRolePath(): string {
        return `/${this.owner.buildId}/`
    }

    public get buildRoleArn(): string {
        return `arn:aws:iam::${this.targetAWSAccountID}:role${this.buildRolePath}${this.buildRoleName}`;
    }

    generateDynamicEnver(rev: SRC_Rev_REF, newInst: IContractsEnver | undefined = undefined): IContractsEnver {
        if (!newInst) {
            const cf = this.constructor
            // @ts-ignore
            newInst = new cf(this.owner, this.targetAWSAccountID, this.targetAWSRegion, rev) as IContractsEnver
        }
        return newInst
    }

}

export class AnyContractsEnVer extends ContractsEnver<ContractsBuild<AnyContractsEnVer>> implements IContractsEnver {
}

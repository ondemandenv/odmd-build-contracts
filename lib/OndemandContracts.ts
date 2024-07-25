import {Construct} from "constructs";
import {OdmdConfigNetworking} from "./repos/__networking/odmd-config-networking";
import {OdmdBuildEksCluster} from "./repos/__eks/odmd-build-eks-cluster";
import {OdmdBuildDefaultVpcRds} from "./repos/_default-vpc-rds/odmd-build-default-vpc-rds";
import {OdmdBuildSampleSpringCdk} from "./repos/sample/cdk/odmd-build-sample-spring-cdk";
import {OdmdBuildSampleSpringImg} from "./repos/sample/spring-img/odmd-build-sample-spring-img";
import {AnyContractsEnVer} from "./odmd-model/contracts-enver";
import {ContractsBuild, GithubRepo, SRC_Rev_REF} from "./odmd-model/contracts-build";
import {OdmdBuildDefaultKubeEks} from "./repos/_default-kube-eks/odmd-build-default-kube-eks";
import {App, Aspects} from "aws-cdk-lib";
import {ContractsAspect} from "./odmd-model/contracts-aspect";
import {OdmdConfigOdmdContractsCdk} from "./repos/__contracts/odmd-build-odmd-contracts-cdk";
import {OdmdConfigOdmdContractsNpm} from "./repos/__contracts/odmd-build-odmd-contracts-npm";
import {SampleSpringOpenApi3Cdk} from "./repos/sample-spring-openapi3/sample-spring-open-api3-cdk";
import {SampleSpringOpenApi3Img} from "./repos/sample-spring-openapi3/sample-spring-open-api3-img";


export type GithubRepos = {
    __contracts: GithubRepo
    __eks: GithubRepo
    __networking: GithubRepo
    _defaultKubeEks: GithubRepo
    _defaultVpcRds: GithubRepo
    sample: GithubRepo
    sample1: GithubRepo
}

export type Accounts = {
    central: string,
    networking: string,
    workplace1: string,
    workplace2: string,
};

export class OndemandContracts extends Construct {

    static readonly RES_PREFIX = "odmd-"
    static readonly REGEX_DBClusterIdentifier = /^[a-z](?:(?![-]{2,})[a-z0-9-]){1,62}(?<!-)$/
    static readonly REGEX_DabaseName = /^[A-Za-z_][A-Za-z0-9_$]{0,62}$/
    static readonly STACK_PARAM_ODMD_DEP_REV = 'odmdDepRev'
    static readonly STACK_PARAM_ODMD_BUILD = 'odmdBuildId'
    static readonly STACK_PARAM_BUILD_SRC_REV = 'buildSrcRev'
    static readonly STACK_PARAM_BUILD_SRC_REF = 'buildSrcRef'
    static readonly STACK_PARAM_BUILD_SRC_REPO = 'buildSrcRepo'

    public readonly odmdConfigOdmdContractsCdk
    public readonly odmdConfigOdmdContractsNpm

    public readonly networking

    public readonly eksCluster
    public readonly defaultVpcRds
    public readonly defaultEcrEks

    public readonly DEFAULTS_SVC

    public readonly springRdsCdk
    public readonly springRdsImg
    public readonly springOpen3Img
    public readonly springOpen3Cdk
    // public readonly springRdsEksArgoConfig


    public readonly accounts: Accounts

    public getAccountName(accId: string) {
        return Object.entries(this.accounts).find(([k, v]) => v == accId)![0] as keyof Accounts
    }

    public readonly allAccounts: string[]

    public readonly githubRepos: GithubRepos

    public readonly odmdBuilds: Array<ContractsBuild<AnyContractsEnVer>>;


    private static _inst: OndemandContracts;
    public static get inst() {
        return this._inst
    }

    public static readonly REV_REF_name = 'target_rev_ref'

    public static get REV_REF_value(): string {
        return process.env[this.REV_REF_name]!
    }

    constructor(app: App, accountOverriding: Accounts | undefined = undefined,
                srcReposOverriding: GithubRepos | undefined = undefined, buildIdToRevRefs: Map<string, SRC_Rev_REF[]> | undefined = undefined) {
        super(app, 'ondemandenv');
        if (OndemandContracts._inst) {
            throw new Error(`can't init twice`)
        }
        OndemandContracts._inst = this
        Aspects.of(app).add(new ContractsAspect())

        this.accounts = {
            central: '1111central111',
            networking: '222networking222',
            workplace1: '333workplace1333',
            workplace2: '444aiorzsbx444'
        }

        if (!accountOverriding && process.env.ODMD_ACCOUNTS) {
            let accountsJsonStr = Buffer.from(process.env.ODMD_ACCOUNTS!, 'base64').toString('utf-8');
            accountOverriding = JSON.parse(accountsJsonStr) as Accounts
            console.log(`accountsJsonStr>>>
            
            ${accountsJsonStr}
            
            accountsJsonStr<<<`)
        }
        if (accountOverriding) {
            const keys = Object.keys(this.accounts)
            console.warn(`keys: ${JSON.stringify(keys)}`)
            console.warn(`accountOverriding: ${JSON.stringify(accountOverriding)}`)

            for (const k in accountOverriding) {
                // @ts-ignore
                console.log(`${k} >> ${accountOverriding[k]}`)
            }


            Object.entries(accountOverriding).forEach(ovr => {


                console.warn(`
                
                ovr[0]: ${ovr[0]}
                ovr[1]: ${ovr[1]} 
                
                `)


                if (!keys.includes(ovr[0])) {
                    throw new Error(`wrong account overriding: ${ovr[0]}:  ${ovr[1]}`)
                }
                this.accounts[ovr[0] as keyof Accounts] = ovr[1] as string
            })
        }

        const accEntries = Object.entries(this.accounts);
        if (Array.from(accEntries.keys()).length != Array.from(accEntries.values()).length) {
            throw new Error("Account name to number has to be 1:1!")
        }

        if (srcReposOverriding) {
            this.githubRepos = srcReposOverriding
        } else if (process.env.ODMD_GH_REPOS) {
            this.githubRepos = JSON.parse(Buffer.from(process.env.ODMD_GH_REPOS, 'base64').toString("utf-8")) as GithubRepos
        } else {
            this.githubRepos = {
                __contracts: {owner: 'odmd', name: 'contracts', ghAppInstallID: 1234},
                __eks: {owner: 'odmd', name: 'eks', ghAppInstallID: 1234},
                __networking: {owner: 'odmd', name: 'networking', ghAppInstallID: 1234},
                _defaultKubeEks: {owner: 'odmd', name: 'defaultKubeEks', ghAppInstallID: 1234},
                _defaultVpcRds: {owner: 'odmd', name: 'defaultVpcRds', ghAppInstallID: 1234},
                sample: {owner: 'odmd', name: 'sample', ghAppInstallID: 1234},
                sample1: {owner: 'odmd', name: 'sample1', ghAppInstallID: 1234},

            }
        }

        this.allAccounts = Object.values(this.accounts)
        this.odmdConfigOdmdContractsNpm = new OdmdConfigOdmdContractsNpm(this)

        this.networking = new OdmdConfigNetworking(this)

        this.eksCluster = new OdmdBuildEksCluster(this)
        this.defaultVpcRds = new OdmdBuildDefaultVpcRds(this)
        this.defaultEcrEks = new OdmdBuildDefaultKubeEks(this)

        this.DEFAULTS_SVC = [this.defaultVpcRds, this.defaultEcrEks] as ContractsBuild<AnyContractsEnVer>[]

        this.springRdsImg = new OdmdBuildSampleSpringImg(this)
        this.odmdConfigOdmdContractsCdk = new OdmdConfigOdmdContractsCdk(this)
        this.springRdsCdk = new OdmdBuildSampleSpringCdk(this)
        this.springOpen3Img = new SampleSpringOpenApi3Img(this)
        this.springOpen3Cdk = new SampleSpringOpenApi3Cdk(this)
        // this.springRdsEksArgoConfig = new OdmdBuildSampleSpringEksArgo(this)

        this.odmdBuilds = [
            this.odmdConfigOdmdContractsCdk,
            this.odmdConfigOdmdContractsNpm,
            this.networking,
            this.eksCluster,
            this.defaultVpcRds,
            this.defaultEcrEks,
            this.springRdsImg,
            this.springRdsCdk,
            this.springOpen3Img,
            this.springOpen3Cdk,
            // this.springRdsEksArgoConfig,
        ]
        if (new Set(this.odmdBuilds).size != this.odmdBuilds.length) {
            throw new Error('duplicated envers?!')
        }

        if (!process.env[OndemandContracts.REV_REF_name]) {
            throw new Error(`have to have process.env.${OndemandContracts.REV_REF_name}!`)
        }
        if (!process.env.CDK_CLI_VERSION) {
            throw new Error("have to have process.env.CDK_CLI_VERSION!")
        }


        const buildRegion = process.env.CDK_DEFAULT_REGION;
        let buildAccount: string;
        if (process.env.CDK_DEFAULT_ACCOUNT) {
            buildAccount = process.env.CDK_DEFAULT_ACCOUNT;
        } else {
            console.log(`process.env.CDK_DEFAULT_ACCOUNT undefined, trying to find account in CodeBuild with CODEBUILD_BUILD_ARN: ${process.env.CODEBUILD_BUILD_ARN}`)
            if (!process.env.CODEBUILD_BUILD_ARN) {
                throw new Error(`process.env.CODEBUILD_BUILD_ARN undefined, unable to initialize without account information.`)
            }
            buildAccount = process.env.CODEBUILD_BUILD_ARN!.split(":")[4];
        }
        if (!buildRegion || !buildAccount) {
            throw new Error("buildRegion>" + buildRegion + "; buildAccount>" + buildAccount)
        }
    }
}
